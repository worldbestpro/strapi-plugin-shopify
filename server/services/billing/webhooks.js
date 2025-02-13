'use strict';

const disableBilling = process.env.SHOPIFY_DISABLE_BILLING === 'true';

const enabledExport = ({ strapi }) => ({
  APP_SUBSCRIPTIONS_UPDATE: async (topic, shop, body) => {
    const subscriptionService = strapi.service('plugin::shopify.subscription');
    const gid = body.app_subscription.admin_graphql_api_id;
    const id = subscriptionService.subscriptionGidToId(gid);
    const status = body.app_subscription.status;
    const lifecycles = strapi.service('plugin::shopify.lifecycles');
    // run before subscribe lifecycles
    if (status === 'ACTIVE') await lifecycles.run('beforeSubscribe', shop);
    // update subscription
    await subscriptionService.update(id, { data: { status } });
    // run after subscribe lifecycles
    if (status === 'ACTIVE') await lifecycles.run('afterSubscribe', shop);
    strapi.log.info(`Subscription ${id} updated successfully to ${status}`);
  },
});

module.exports = ({ strapi }) => (!disableBilling ? enabledExport({ strapi }) : {});
