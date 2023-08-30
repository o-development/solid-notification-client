import { DataFactory } from 'n3'
import { parseTurtle, getDescriptionResource, getOneMatchingQuad, getAllMatchingQuads, NOTIFY, getStorageDescription } from '@janeirodigital/interop-utils'
import type { DatasetCore } from '@rdfjs/types'
import { ChannelType, SubscriptionService } from '@solid-notifications/types'

export class DiscoveryClient {

  private rdf: {
    contentType: 'text/turtle' | 'application/ld+json',
    parse: typeof parseTurtle
  }
  constructor(private authnFetch: typeof fetch) {
    // TODO pass Turtle or JSON-LD parser and set accordignly
    this.rdf = {
      contentType: 'text/turtle',
      parse: parseTurtle
    }
  }

  async findService(resourceUri: string, channelType: ChannelType): Promise<SubscriptionService | null> {

    const storageDescription = await this.fetchStorageDescription(resourceUri)

    // TODO handle multiple matching services
    const serviceNode = getOneMatchingQuad(storageDescription, null, NOTIFY.channelType, DataFactory.namedNode(channelType))?.subject
    if (!serviceNode) return null
    const features = getAllMatchingQuads(storageDescription, serviceNode, NOTIFY.feature).map(quad => quad.object.value)
    return {
      id: serviceNode.value,
      channelType,
      feature: features
    }
  }


  // TODO use some rdf-fetch util
  async fetchResource(resourceUri): Promise<DatasetCore> {
    const response = await this.authnFetch(resourceUri, {
      headers: {
        'Accept': this.rdf.contentType
      }
    })
    if (response.status <200 || response.status >300){
      throw Error(`Failed fetching resource: ${resourceUri}`)
    }
    return this.rdf.parse(await response.text(), response.url)
  }

  async discoverStorageDescription(resourceUri: string): Promise<string> {
    const response = await this.authnFetch(resourceUri, { method: 'head' })
    if (response.status <200 || response.status >300){
      throw Error(`Failed fetching resource: ${resourceUri}`)
    }
    return getStorageDescription(response.headers.get('Link'))
  }

  async fetchStorageDescription(resourceUri): Promise<DatasetCore> {
    const storageDescriptionUri = await this.discoverStorageDescription(resourceUri)
    return this.fetchResource(storageDescriptionUri)
  }

  async discoverDescriptionResource(resourceUri: string): Promise<string> {
    const response = await this.authnFetch(resourceUri, { method: 'head' })
    return getDescriptionResource(response.headers.get('Link'))
  }

  async fetchDescriptionResource(resourceUri): Promise<DatasetCore> {
    const resourceDescriptionUri = await this.discoverDescriptionResource(resourceUri)
    return this.fetchResource(resourceDescriptionUri)
  }
}
