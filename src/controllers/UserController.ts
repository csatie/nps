import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as yup from 'yup';
import { AppError } from '../errors/AppError';
import { UsersRepository } from '../repositories/UserRepository';

class UserController {
  async create(request: Request, response: Response) {
    const { name, email, gender, city, date_of_birth } = request.body;

    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
    });

    if (!(await schema.isValid(request.body))) {
      throw new AppError('validation failed');
    }

    const usersRepository = getCustomRepository(UsersRepository);

    const userAlreadyExists = await usersRepository.findOne({
      email,
    });

    if (userAlreadyExists) {
      throw new AppError('User already exists');
    }

    const user = usersRepository.create({
      name,
      email,
      gender,
      date_of_birth,
      city,
    });

    await usersRepository.save(user);

    return response.status(201).json(user);
  }
}

export { UserController };
