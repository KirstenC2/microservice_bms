import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
const Consul = require('consul');

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private consul: any;
  private serviceId: string;

  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'consul',
      port: Number(process.env.CONSUL_PORT) || 8500,
    });
    const serviceName = process.env.SERVICE_NAME || 'booking-service';
    this.serviceId = `${serviceName}-${Math.random().toString(36).slice(2,7)}`;
  }

  async onModuleInit() {
    const serviceName = process.env.SERVICE_NAME || 'booking-service';
    const servicePort = Number(process.env.SERVICE_PORT) || 50051;
    const serviceHost = process.env.SERVICE_HOST || 'booking-service';

    await this.consul.agent.service.register({
      id: this.serviceId,
      name: serviceName,
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
