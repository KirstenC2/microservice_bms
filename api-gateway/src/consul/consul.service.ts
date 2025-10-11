import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Consul from 'consul';

@Injectable()
export class ConsulDiscoveryService {
  private readonly logger = new Logger(ConsulDiscoveryService.name);
  private consul: any;

  constructor(private configService: ConfigService) {
    this.consul = new Consul({
      host: this.configService.get('CONSUL_HOST', 'consul'),
      port: this.configService.get('CONSUL_PORT', 8500),
      secure: false,
    });
  }

  async getServiceAddress(serviceName: string): Promise<{ host: string; port: number }> {
    try {
      this.logger.log(`Looking up service: ${serviceName}`);
      
      // Use health endpoint to get nodes with their health status
      const healthInfo = await this.consul.health.service(serviceName);
      this.logger.log(`Found ${healthInfo.length} health entries for service ${serviceName}`);
      
      if (!healthInfo.length) {
        throw new Error(`Service ${serviceName} not found in Consul`);
      }

      // Filter passing health checks
      const healthyEntries = healthInfo.filter((entry: any) => {
        return entry.Checks.every((check: any) => check.Status === 'passing');
      });

      this.logger.log(`Found ${healthyEntries.length} healthy entries out of ${healthInfo.length} total`);

      if (!healthyEntries.length) {
        throw new Error(`No healthy nodes found for service ${serviceName}`);
      }

      // Use first healthy entry
      const selectedEntry = healthyEntries[0];
      const address = { 
        // Prefer Service.Address, fallback to Node.Address
        host: selectedEntry.Service.Address || selectedEntry.Node.Address, 
        port: selectedEntry.Service.Port 
      };

      this.logger.log(`Selected service: ${selectedEntry.Service.Service}`);
      this.logger.log(`Service address: ${selectedEntry.Service.Address}`);
      this.logger.log(`Node address: ${selectedEntry.Node.Address}`);
      this.logger.log(`Final selected address: ${address.host}:${address.port}`);

      return address;

    } catch (error) {
      this.logger.error(`Failed to discover service ${serviceName}:`, error);
      throw error;
    }
  }

  async getService(serviceName: string): Promise<{ host: string; port: number }[]> {
    try {
      const healthInfo = await this.consul.health.service(serviceName);
      return healthInfo
        .filter((entry: any) => entry.Checks.every((check: any) => check.Status === 'passing'))
        .map((entry: any) => ({
          host: entry.Service.Address || entry.Node.Address,
          port: entry.Service.Port,
        }));
    } catch (error) {
      this.logger.error(`Failed to get service nodes for ${serviceName}:`, error);
      throw error;
    }
  }

  // Debug method to see raw Consul data
  async debugService(serviceName: string): Promise<any> {
    try {
      const catalogNodes = await this.consul.catalog.service.nodes(serviceName);
      const healthInfo = await this.consul.health.service(serviceName);
      
      this.logger.debug('=== CATALOG NODES ===');
      catalogNodes.forEach((node: any, index: number) => {
        this.logger.debug(`Node ${index}: ${JSON.stringify({
          NodeAddress: node.Address,
          ServiceAddress: node.ServiceAddress,
          ServicePort: node.ServicePort,
          ServiceID: node.ServiceID
        })}`);
      });

      this.logger.debug('=== HEALTH INFO ===');
      healthInfo.forEach((entry: any, index: number) => {
        this.logger.debug(`Health Entry ${index}: ${JSON.stringify({
          NodeAddress: entry.Node.Address,
          ServiceAddress: entry.Service.Address,
          ServicePort: entry.Service.Port,
          ServiceID: entry.Service.ID,
          Checks: entry.Checks.map((check: any) => ({
            CheckID: check.CheckID,
            Status: check.Status
          }))
        })}`);
      });

      return { catalogNodes, healthInfo };
    } catch (error) {
      this.logger.error(`Debug failed for service ${serviceName}:`, error);
      throw error;
    }
  }
}