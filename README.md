# Solid Notification Client 

This library implements the disovery and subscription to a Notication Channel following the [Solid Notifications Protocol](https://solidproject.org/TR/notifications-protocol).

## Discovery

A first step for having Solid Notifications is having a resource of interest to which you want to subscribe, we will call this resource the **topic**.
To [discover](https://solidproject.org/TR/notifications-protocol#discovery) whether the topic supports a certain [**channel type**](https://solid.github.io/notifications/protocol#notification-channel-types), you can use the **DiscoveryClient**. (A list of channel types can be found [here](https://github.com/solid/notifications#notificatoin-channel-types))

Following piece of code shows how to use this class.

```javascript
const {DiscoveryClient} = require('@solid-notifications/discovery');

async function main() {
  const topic = "http://localhost:3000/topic.ttl";
  const channelType = "http://www.w3.org/ns/solid/notifications#WebSocketChannel2023";

  const client = new DiscoveryClient(fetch);
  const subscriptionService = await client.findService(topic, channelType);

  console.log(subscriptionService);
}

main()
```

If the subscriptionService is not `null`, then `subscriptionService.id` contains the URL to which a Solid Notification Subscription can be made for the given channel type.

## Subscription

When you know that a given **topic** resource has support for your chosen **channel type**, you follow the [Subscription flow](https://solidproject.org/TR/notifications-protocol#subscription) from the Solid Notification Protocol, which is implemented in the **SubscriptionClient** class.

Following piece of code shows how to use this class.

```javascript
const {SubscriptionClient} = require('@solid-notifications/subscription');

async function main() {
  const topic = "http://localhost:3000/topic.ttl";
  const channelType = "http://www.w3.org/ns/solid/notifications#WebSocketChannel2023";

  const client = new SubscriptionClient(fetch);
  const notificationChannel = await client.subscribe(topic, channelType);

  console.log(notificationChannel);
}

main()
```

In this example, a subscription to a WebSocketChannel2023 has been made. 
So this variable can now be used to set up a WebSocket connection to listen to updates of the topic resource in the Solid Server.
For this, the `receiveFrom` property is used from the `notificationChannel` from the above sample code.

```javascript
const { WebSocket } = require('ws');

// set up a WebSocket using the notificationChannel
const socket = new WebSocket(notificationChannel.receiveFrom)
// print all notifications, which in this case will be notifications from the topic resource
socket.onmessage = (message) => console.log(message.data.toString());
```

## Development Setup

This repository is managed as a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) using [Lerna](https://lernajs.io/).

It can be set up and installed by cloning this repository and installing:

```bash
git clone https://github.com/o-development/solid-notification-client.git
cd solid-notification-client
npm i 
```

Building the project can be achieved through the following command:

```bash
npm run build
```

## Additional information

### Authenticated fetch

The classes **DiscoveryClient** and **SubscriptionClient** require a [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) function to be passed as constructor argument.
The default `fetch` function results into sending unauthenticated requests to a Solid Server.

However, when the topic is a resource which has authorization requirements, you need to pass an authenticated fetch function.
Inrupt provides libraries to which you can log in with your WebID following the [Solid-OIDC](https://solidproject.org/TR/oidc) Protocol:

* [@inrupt/solid-client-authn-node](https://www.npmjs.com/package/@inrupt/solid-client-authn-node) can be used in NodeJs
* [@inrupt/solid-client-authn-browser](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser) can be used in the browser

After logging in, you can use the **Session** object to get an authenticated fetch function: `session.fetch`.

### Notification Sender

For channel types that has a [Notification Sender](https://solidproject.org/TR/notifications-protocol#NotificationSender), an extra argument (an URL) must be provided to announce to the Solid Server the `sendTo` property.

### Setting up a solid server which supports WebSocketChannel2023 and WebhookChannel2023

This can be done with the [Community Solid Server (CSS)](https://github.com/CommunitySolidServer/CommunitySolidServer).

Install the Solid Server:

```sh
npm i @solid/community-server
```

Start a server without setup, with memory storage and with both WebSocketChannel2023 and WebHookSubscription2021 channel types for solid notifications:

```sh
wget https://raw.githubusercontent.com/woutslabbinck/Solid-Notification/main/config/memory-config.json
npx @solid/community-server -c memory-config.json 
```

## Feedback and questions

Do not hesitate to [report a bug](https://github.com/o-development/solid-notification-client/issues)