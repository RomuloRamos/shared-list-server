import {Request, Response, NextFunction} from 'express';
import  {HttpStatusCode} from '@src/util/http-status-code';
import {Controller, Get, Post, Delete, Put} from '@overnightjs/core';
import {Database, iUserDb} from '@src/database';
import {LogRegister} from '@src/util/logRegister';
import bcrypt from 'bcrypt';
import tokenHandle, { JwtPayload } from 'jsonwebtoken';

@Controller('api/v0/authenticate')
export class AuthController{
    private static db:Database;
    private static userDb:any;
    // private static sessionsDB;
    private pvLog!:LogRegister;

    constructor(){
        this.pvLog = new LogRegister();
        AuthController.db = new Database();
        AuthController.userDb = AuthController.db.ModelUser;
        this.pvLog.log("New Instance created!");
    }
    
    public static async authValidate(req:Request, res:Response, next:NextFunction): Promise<void>{
        console.log("authValidate called");
        try {
            const authorization_code = req.headers['authorization'];
            const bearerToken = authorization_code?.split(" ");
            if(bearerToken?.length === 2){
                const access_token = bearerToken[1];
                console.log("authValidate token: ", access_token);
                const accessTokenInfo = tokenHandle.verify(access_token, process.env.JWT_SECRET_KEY as string, {complete:true})
                //TODO - It's only a test, so, anything is being made with accessTokenInfo only a test of expiration time.
                const {exp} = accessTokenInfo.payload as JwtPayload;
                if ((exp) && (Date.now() >= exp * 1000)){
                    throw new Error("Invalid token");                    
                }
                next();
            }
            else throw new Error("Not authenticated");
        } catch (error: any) {
            console.log("ERROR: /n" + error);
            res.status(HttpStatusCode.UNAUTHORIZED).send({error:error.message});
        }

    }

    //Receive a code, for a grant_type as authorization_code and exchange it to 
    // a authorization token and id token, that should be returned to application 
    @Post('')
    public async authenticateUser(req:Request, res:Response): Promise<void>{
        this.pvLog.log("authenticateUser called");
        try {
            const {login,password} = req.body;
            let userData = await AuthController.db.ModelUser.getOneByLogin(login);
            if(!userData){
                userData = await AuthController.db.ModelUser.getOneByEmail(login);
            }
            if(userData){
                const auth = await bcrypt.compare(password, userData.password);
                if(auth){
                    const jwt = tokenHandle.sign(
                        {...userData, password:undefined, login: undefined},
                        process.env.JWT_SECRET_KEY as string,
                        {expiresIn: "1d"}
                        )
                    res.status(HttpStatusCode.OK).send({
                        token: jwt,
                        user:userData
                    });
                }
                else{
                    res.status(HttpStatusCode.UNAUTHORIZED).send({error:"Incorrect Password"});
                }
            }
            else{
                throw new Error("User not found");
            }
        } catch (error) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.UNAUTHORIZED).send({error:"Authentication Fail"})
        }
    }


    @Post('sso')
    public async authenticateSSO(req:Request, res:Response): Promise<void>{
        this.pvLog.log("authenticateSSO called");
        try {
            const {login,app_token} = req.body;
            const userData = await AuthController.db.ModelUser.getOneByEmail(login);
            if(userData){
                const jwtPayload = tokenHandle.verify(app_token, process.env.JWT_SECRET_KEY as string,{complete:true});
                //TODO - It's only a test, so, anything is being made with accessTokenInfo only a test of expiration time.
                const {ext} = jwtPayload.payload as JwtPayload;
                if (Date.now() >= ext * 1000){
                    throw new Error("Invalid token");                    
                }
                const jwt = tokenHandle.sign(
                    {...userData, password:undefined, login: undefined},
                    process.env.JWT_SECRET_KEY as string,
                    {expiresIn: "1d"}
                    )
                res.status(HttpStatusCode.OK).send({
                    token: jwt,
                    user:userData
                });
            }
            else{
                throw new Error("This login doesn't exist");
            }
        } catch (error:any) {
            this.pvLog.log("ERROR: /n" + error);
            res.status(HttpStatusCode.UNAUTHORIZED).send({error:"Invalid sso credentials"})
        }
    }

}
