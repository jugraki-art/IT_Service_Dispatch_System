import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      status: 'online',
      message: 'Nest.js Backend is running with MySQL connection!',
      timestamp: new Date().toISOString(),
      database: 'Connected to XAMPP MySQL (react_nest_db)',
    };
  }
}
