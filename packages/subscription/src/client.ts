import { DataFactory, Store } from 'n3'
import { NOTIFY, RDF, getOneMatchingQuad, parseTurtle, serializeTurtle } from '@janeirodigital/interop-utils'
import { DiscoveryClient } from '@solid-notifications/discovery'

import type { DatasetCore } from '@rdfjs/types'
import type { ChannelType, NotificationChannel } from '@solid-notifications/types'

function buildChannel(topic: string, channelType: ChannelType, sendTo: string): DatasetCore {
  const channel = new Store() as DatasetCore
  const subject = DataFactory.blankNode()
  channel.add(DataFactory.quad(subject, RDF.type, DataFactory.namedNode(channelType)))
  channel.add(DataFactory.quad(subject, NOTIFY.topic, DataFactory.namedNode(topic)))
  if (sendTo) {
    channel.add(DataFactory.quad(subject, NOTIFY.sendTo, DataFactory.namedNode(sendTo)))
  }
  return channel
}

function formatChannel(dataset: DatasetCore): NotificationChannel {
  const subject = getOneMatchingQuad(dataset, null, RDF.type).subject
  const channel = {
    id: subject.value,
    type: getOneMatchingQuad(dataset, subject, RDF.type).object.value as ChannelType, // TODO: improve typing
    topic: getOneMatchingQuad(dataset, subject, NOTIFY.topic).object.value,
  } as NotificationChannel
  const receiveFrom = getOneMatchingQuad(dataset, subject, NOTIFY.receiveFrom)?.object.value
  if (receiveFrom) channel.receiveFrom = receiveFrom
  const sendTo = getOneMatchingQuad(dataset, subject, NOTIFY.sendTo)?.object.value
  if (sendTo) channel.sendTo = sendTo

  return channel
}


export class SubscriptionClient {
  private rdf: {
    contentType: 'text/turtle' | 'application/ld+json',
    parse: typeof parseTurtle
    serialize: typeof serializeTurtle
  }

  discovery = new DiscoveryClient(this.authnFetch)

  constructor(private authnFetch: typeof fetch) {
    // TODO pass Turtle or JSON-LD parser and set accordignly
    this.rdf = {
      contentType: 'text/turtle',
      parse: parseTurtle,
      serialize: serializeTurtle
    }
  }

  async subscribe(topic: string, channelType: ChannelType, sendTo?: string): Promise<NotificationChannel> {
    // TODO: validate presence of sendTo based on known channel type
    const service = await this.discovery.findService(topic, channelType)
    const requestedChannel = buildChannel(topic, channelType, sendTo)
    const response = await this.authnFetch(service.id, {
      method: 'POST',
      body: await this.rdf.serialize(requestedChannel),
      headers: {
        'Accept': this.rdf.contentType,
        'Content-Type': this.rdf.contentType
      }
    })
    if(!response.headers.get('Content-Type').startsWith(this.rdf.contentType)) {
      throw new Error('unexpected Content Type')
    }
    const dataset = await this.rdf.parse(await response.text(), response.url)
    return formatChannel(dataset)
  }

}