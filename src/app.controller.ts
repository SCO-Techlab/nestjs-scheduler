import { Controller, Get } from "@nestjs/common";

@Controller('nestjs-scheduler')
export class AppController {

  constructor() { }

  @Get()
  async dummy(): Promise<string> {
    return 'Hello world - Nestjs Scheduler';
  }

}
