import { Response, Request } from 'express';
import { User } from '@prisma/client';

import { getPrismaClient } from '../../libs/prisma';

export const createUser = async (
  req: Request,
  res: Response<User | { error: string }>,
) => {
  console.log('[createUser] Request received: ', JSON.stringify(req.body));

  const body = req.body;

  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    try {
      const organisation = await tx.organisation.create({
        data: {
          name: body.organisation,
        },
      });

      const user = await tx.user.create({
        data: {
          organisationId: organisation.id,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          birthdate: body.birthdate,
          cognitoId: body.cognitoId,
        },
        include: {
          organisation: true,
        },
      });

      return res.status(200).json(user);
    } catch (err) {
      console.error('[createUser] Error creating user', err);

      return res
        .status(500)
        .json({ error: 'There was an error creating the user' });
    }
  });
};
