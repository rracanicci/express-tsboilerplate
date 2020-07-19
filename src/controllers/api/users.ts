import _ from 'lodash';
import joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { Controller, Get, Post, Put, Delete } from '../../utils/controller-base';
import { validateQuery, validateBody, validateParams } from '../../middlewares/validation';
import { User } from '../../db/models/user';
import { Op, UniqueConstraintError } from 'sequelize';
import { Conflict, NotFound } from 'http-errors';
import { db } from '../../db/sequelize';

@Controller('/api/users')
export class UsersRouter {
  @Get(
    '/',
    validateQuery(
      joi.object({
        id: joi.number().positive().optional(),
        name: joi.string().min(1).max(255).optional()
      })
    )
  )
  public async get(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    const { id, name } = req.query;
    const users: User[] = await User.findAll({
      where: _.pickBy({
        id: id,
        name: name ? {
          [Op.like]: `%${name}%`
        } : undefined
      }, _.identity) as any
    });

    if (users.length == 0) {
      return next(new NotFound('no user found'));
    }
    res.json(users);
  }

  @Post(
    '/',
    validateBody(
      joi.object({
        name: joi.string().min(1).max(255).required()
      })
    )
  )
  public async create(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    const { name } = req.body;

    try {
      await db.transaction(async t => {
        const user = await User.create({
          name: name
        }, { transaction: t });
        res.status(201);
        res.json(user);
      });
    }
    catch(err) {
      if (err instanceof UniqueConstraintError) {
        return next(new Conflict(`name "${name}" already exists`));
      }
      return next(err);
    }
  }

  @Put(
    '/:id',
    validateParams(
      joi.object({
        id: joi.number().positive().required()
      })
    ),
    validateBody(
      joi.object({
        name: joi.string().min(1).max(255).required()
      })
    )
  )
  public async update(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const { name } = req.body;

    try {
      await db.transaction(async t => {
        const [user, created] = await User.findOrCreate({
          where: {
            id: id
          },
          defaults: {
            name: name
          },
          transaction: t
        });

        if (!created) {
          user.name = name;
        }
        res.status(created ? 201 : 200);
        res.json(await user.save({ transaction: t }));
      });
    }
    catch(err) {
      if (err instanceof UniqueConstraintError) {
        return next(new Conflict(`name "${name}" already exists`));
      }
      return next(err);
    }
  }

  @Delete(
    '/:id',
    validateParams(
      joi.object({
        id: joi.number().positive().required()
      })
    )
  )
  public async delete(
    req: Request, res: Response, _next: NextFunction
  ): Promise<void> {
    const { id } = req.params;

    await db.transaction(async t => {
      let user = await User.findOne({
        where: {
          id: id
        },
        transaction: t
      });

      if (!user) {
        throw new NotFound(`user with id ${id} not found`);
      }
      user = await user.destroy({ transaction: t });
      res.json(user);
    });
  }
}