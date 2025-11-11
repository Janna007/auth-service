import express, { NextFunction, Request, Response } from 'express'
import authenticate from '../middlewares/authenticate'
import canAccess from '../middlewares/canAccess'
import { roles } from '../constants'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import { User } from '../entity/User'
import { AppDataSource } from '../config/data-source'
import userCreateValidator from '../validators/user-create-validator'

const router = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService)

router.post(
    '/',
    userCreateValidator,
    authenticate,
    canAccess([roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
)

router.post(
    '/update/:id',
    userCreateValidator,
    authenticate,
    canAccess([roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
)

router.get(
    '/',
    authenticate,
    canAccess([roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getUsers(req, res, next),
)

router.get(
    '/:id',
    authenticate,
    canAccess([roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOneUser(req, res, next),
)

router.delete(
    '/:id',
    authenticate,
    canAccess([roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.deleteUser(req, res, next),
)

export default router
