import * as hubspot from "@hubspot/api-client";
import {
  DeleteWebhookEndpointProps,
  Events,
  InitProps,
  IntegrationClassI,
  Truthy,
  VerifyWebhookSignatureProps,
} from "../../types/classDefinition";
import { SubscriptionCreateRequestEventTypeEnum } from "@hubspot/api-client/lib/codegen/webhooks/models/SubscriptionCreateRequest";
import { SubscriptionResponse } from "@hubspot/api-client/lib/codegen/webhooks";
import { SubscriptionResponseEventTypeEnum } from "@hubspot/api-client/lib/codegen/webhooks/models/SubscriptionResponse";
import { executeWithRateLimit } from "./helpers";
import { SettingsResponse } from "@hubspot/api-client/lib/codegen/webhooks/models/SettingsResponse";

export class HubspotIntegration implements IntegrationClassI {
  id = "intg_65c33a5b6e1286b561a83bc0";

  name = "Hubspot";

  private readonly client: hubspot.Client;
  private readonly DEVELOPER_API_KEY: string;
  private readonly APP_ID: number;
  private readonly CLIENT_SECRET: string;
  private readonly REQUESTS_QTY_PER_SEC = 10;
  private readonly RATE_LIMIT_TIMEOUT = 1000;
  private readonly MAX_CONCURRENT_REQUESTS: number;

  constructor({
    developerApiKey,
    appId,
    clientSecret,
    maxConcurrentRequests = 10,
  }: {
    developerApiKey: string;
    appId: number;
    clientSecret: string;
    maxConcurrentRequests?: number;
  }) {
    this.DEVELOPER_API_KEY = developerApiKey;
    this.CLIENT_SECRET = clientSecret;
    this.APP_ID = appId;
    this.MAX_CONCURRENT_REQUESTS = maxConcurrentRequests;
    this.client = new hubspot.Client({
      developerApiKey: this.DEVELOPER_API_KEY,
    });
  }

  verifyWebhookSignature(props: VerifyWebhookSignatureProps): boolean {
    return this.client.webhooks.validateSignature(
      props.signature,
      this.CLIENT_SECRET,
      props.request.body,
    );
  }

  async init(props: { webhookUrl: string; events: SubscriptionResponseEventTypeEnum[] }): Promise<{
    webhookData: SubscriptionResponse[];
    events: SubscriptionResponseEventTypeEnum[];
  }> {
    await this.client.webhooks.settingsApi.configure(this.APP_ID, {
      targetUrl: props.webhookUrl,
      throttling: {
        maxConcurrentRequests: 10,
        period: "SECONDLY",
      },
    });

    const webhooks = await this.subscribe({
      events: props.events,
    });

    return {
      events: webhooks.events,
      webhookData: webhooks.webhooks,
    };
  }

  async getSubscribedEvents(props: { webhookIds: string[] }): Promise<Events> {
    const events = await this.getWebhooks({
      webhookIds: props.webhookIds,
    });

    return events.map(({ eventType }) => eventType);
  }

  async getWebhooks(props?: { webhookIds: string[] }): Promise<SubscriptionResponse[]> {
    try {
      const { webhookIds } = props || {};
      const { results } = await this.client.webhooks.subscriptionsApi.getAll(this.APP_ID);

      if (webhookIds) {
        return results.filter(({ id }) => webhookIds.includes(id));
      }

      return results;
    } catch (error) {
      throw new Error(`An error occurred on retrieving webhooks: ${error.message}`);
    }
  }

  async subscribe({
    events,
    webhookIds,
  }: {
    events: SubscriptionResponseEventTypeEnum[];
    webhookIds?: string[];
  }): Promise<{
    events: SubscriptionResponseEventTypeEnum[];
    webhooks: SubscriptionResponse[];
  }> {
    const webhooks = await this.getWebhooks({
      webhookIds,
    });
    try {
      const createdWebhooks = await executeWithRateLimit({
        fetchCallbacks: events.map(
          (eventType) => () =>
            this.client.webhooks.subscriptionsApi.create(this.APP_ID, {
              eventType: eventType as SubscriptionCreateRequestEventTypeEnum,
            }),
        ),
        timeout: this.RATE_LIMIT_TIMEOUT,
        requestsLimit: this.REQUESTS_QTY_PER_SEC,
      });
      const result = webhooks.concat(createdWebhooks);

      return {
        events: result.map(({ eventType }) => eventType),
        webhooks: result,
      };
    } catch (e) {
      if (e.body.category === "VALIDATION_ERROR") {
        console.error(e);
        // todo: delete all created subscriptions so it would be work as a transaction
        return {
          events: webhooks.map(({ eventType }) => eventType),
          webhooks,
        };
      }

      throw new Error(`An error occurred on subscription to the events: ${e.message}`);
    }
  }

  async unsubscribe({
    webhookIds,
    events,
  }: {
    events: SubscriptionResponseEventTypeEnum[];
    webhookIds: string[];
  }): Promise<{
    events: SubscriptionResponseEventTypeEnum[];
    webhooks: SubscriptionResponse[];
  }> {
    const webhooks = await this.getWebhooks({
      webhookIds: webhookIds,
    });
    const webhookIdsToUnsubscribe = webhooks
      .filter(({ eventType }) => events.includes(eventType))
      .map(({ id }) => id);
    try {
      await executeWithRateLimit({
        fetchCallbacks: webhookIdsToUnsubscribe.map(
          (id) => () =>
            this.client.webhooks.subscriptionsApi.archive(Number.parseInt(id), this.APP_ID),
        ),
        requestsLimit: this.REQUESTS_QTY_PER_SEC,
        timeout: this.RATE_LIMIT_TIMEOUT,
      });
      const resultWebhooks = webhooks.filter(({ id }) => !webhookIdsToUnsubscribe.includes(id));

      return {
        webhooks: resultWebhooks,
        events: resultWebhooks.map(({ eventType }) => eventType),
      };
    } catch {}
  }

  async deleteWebhookEndpoint(props: DeleteWebhookEndpointProps): Promise<Truthy> {
    try {
      await this.client.webhooks.subscriptionsApi.archive(
        Number.parseInt(props.webhookId),
        this.APP_ID,
      );
    } catch (error) {
      throw new Error(`An error occurred on deleting webhook endpoint: ${error.message}`);
    }

    return true;
  }

  async testConnection(): Promise<SettingsResponse> {
    try {
      const result = await this.client.webhooks.settingsApi.getAll(this.APP_ID);
      return result;
    } catch {
      throw new Error(`An error occurred on test connection`);
    }
  }
}
