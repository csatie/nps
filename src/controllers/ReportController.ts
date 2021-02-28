import { Request, Response } from 'express';
import request from 'supertest';
import { resolve } from 'path';
import SendMailService from '../services/SendMailService';
import { NpsController } from './NpsController';

class ReportController {
  async execute(req: Request, res: Response) {
    const { survey_id } = req.body;

    const npsController = new NpsController();

    const client = request(req.app);
    const nps = await client.get('/nps/:survey_id', npsController.execute);

    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'report.hbs');

    const variables = nps.body;
    await SendMailService.execute(
      process.env.ADMIN_MAIL,
      nps.title,
      variables,
      npsPath,
    );

    return res.status(200).json(variables);
  }
}

export { ReportController };
