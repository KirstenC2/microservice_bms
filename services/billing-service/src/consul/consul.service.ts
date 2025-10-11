import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
const Consul = require('consul');

require('dotenv').config();

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private consul: any;
  private serviceId: string;

  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: Number(process.env.CONSUL_PORT) || 8500,
    });
    this.serviceId = `${process.env.SERVICE_NAME}-${require('os').hostname()}`;
  }

  async onModuleInit() {
    const servicePort = Number(process.env.SERVICE_PORT) || 50052;
    const serviceHost = process.env.SERVICE_HOST || 'billing-service';

    await this.consul.agent.service.register({
      id: this.serviceId,
      name: process.env.SERVICE_NAME || 'billing-service',
      address: serviceHost,
      port: servicePort,
      check: {
        tcp: `${serviceHost}:${servicePort}`,
        interval: '10s',
        timeout: '5s',
      },
    });
    console.log(`[Consul] Registered ${this.serviceId}`);
  }

  async onModuleDestroy() {
    await this.consul.agent.service.deregister(this.serviceId);
    console.log(`[Consul] Deregistered ${this.serviceId}`);
  }
}
