// services/api-gateway/src/app.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  HttpStatus,
  HttpException 
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  // 服务地址配置
  private readonly services = {
    booking: 'http://booking-service:50051',
  };



  // ========== 预约相关路由 ==========
  @Get('bookings')
  async getBookings(@Query() query: any) {
    const queryString = new URLSearchParams(query).toString();
    return this.forwardRequest('booking', 'GET', `/bookings?${queryString}`);
  }

  @Get('bookings/:id')
  async getBooking(@Param('id') id: string) {
    return this.forwardRequest('booking', 'GET', `/bookings/${id}`);
  }

  @Post('bookings')
  async createBooking(@Body() data: any) {
    return this.forwardRequest('booking', 'POST', '/bookings', data);
  }

  @Post('bookings/:id/cancel')
  async cancelBooking(@Param('id') id: string, @Body() data: any) {
    return this.forwardRequest('booking', 'POST', `/bookings/${id}/cancel`, data);
  }

  @Get('users/:userId/bookings')
  async getUserBookings(@Param('userId') userId: string) {
    return this.forwardRequest('booking', 'GET', `/bookings/user/${userId}`);
  }

  @Get('availability/:roomId')
  async checkAvailability(
    @Param('roomId') roomId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.forwardRequest(
      'booking', 
      'GET', 
      `/bookings/availability/${roomId}?startTime=${startTime}&endTime=${endTime}`
    );
  }

  // ========== 私有方法：转发请求 ==========
  private async forwardRequest(
    service: string, 
    method: string, 
    path: string, 
    data?: any
  ) {
    try {
      const baseUrl = this.services[service];
      const url = `${baseUrl}${path}`;

      const response = await this.httpService.request({
        method,
        url,
        data,
        timeout: 10000,
      }).toPromise();

      if (!response) {
        throw new HttpException(
          `Service ${service} is unavailable`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      return response?.data;
    } catch (error) {
      // 处理错误响应
      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Service error',
          error.response.status,
        );
      } else {
        throw new HttpException(
          `Service ${service} is unavailable`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  }
}