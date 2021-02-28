import { Request, Response } from 'express';
import { getCustomRepository, Not, IsNull } from 'typeorm';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UserCategoryController } from './UserCategoryController';

class NpsController {
  async execute(request: Request, response: Response) {
    const { survey_id } = request.params;

    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveyUsers = await surveysUsersRepository.find({
      survey_id,
      value: Not(IsNull()),
      relations: ['user'],
    });

    const detractors = { total: 0, gender: {}, city: {}, date_of_birth: {} };
    const promoters = { total: 0, gender: {}, city: {}, date_of_birth: {} };
    const passives = { total: 0, gender: {}, city: {}, date_of_birth: {} };

    surveyUsers.map(survey => {
      const { gender, city, date_of_birth } = survey.user;

      if (survey.value >= 0 && survey.value <= 6) {
        const userCategory = detractors;
      } else if (survey.value >= 9 && survey.value <= 10) {
        const userCategory = promoters;
      } else {
        const userCategory = passives;
      }

      userCategory.total++;
      userCategory.gender[gender] = gender in userCategory.gender ? +1 : 1;
      userCategory.city[city] = city in userCategory.city ? +1 : 1;
      userCategory.date_of_birth[date_of_birth] =
        date_of_birth in userCategory.date_of_birth ? +1 : 1;
    });

    const totalAnswers = surveyUsers.length;

    const calculate = Number(
      ((promoters.total - detractors.total) / totalAnswers) * 100,
    ).toFixed(2);

    return response.json({
      detractors,
      promoters,
      passives,
      totalAnswers,
      nps: calculate,
    });
  }
}

export { NpsController };
