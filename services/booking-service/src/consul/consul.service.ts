import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
const Consul = require('consul');

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private consul: any;
  private serviceId: string;

  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: Number(process.env.CONSUL_PORT) || 8500,
    });
    this.serviceId = `${process.env.SERVICE_NAME}-${Math.random().toString(36).slice(2,7)}`;
  }

  async onModuleInit() {
    await this.consul.agent.service.register({
      id: this.serviceId,
      name: process.env.SERVICE_NAME,
      address: process.env.HOSTNAME,
      port: Number(process.env.SERVICE_PORT),
      check: {
        tcp: `${process.env.HOSTNAME}:${process.env.SERVICE_PORT}`,
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
