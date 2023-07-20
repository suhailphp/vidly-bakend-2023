const { Router } = require('express');
const route = Router();
const GrenreService = require('../services/genre');
const MovieService = require('../services/movie');
const EmployeeService = require('../services/employee');
const Utils = require('../utilities');
const moduleName = 'api';
const appConfig = require('../config');
const jwt = require("jsonwebtoken");

module.exports = (app) => {

  app.use('/api', route);
  const genreService = new GrenreService();
  const movieService = new MovieService();
  const employeeService = new EmployeeService();

  route.get(
    '/movie/',
    async (req,res,next)=>{
      try{
        const data = await movieService.getAll()
        res.send(data)
      }
      catch(e){
          res.status(400).send('Something went wrong')
      }
    }
  )

  route.get(
    '/movie/:movieID',
    async (req,res,next)=>{
      try{
        const data = await movieService.getOneForAPI(req.params.movieID)
        if(data)
          res.send(data)
        else
          return res.status(404).send("The Movie with the given ID was not found.");
      }
      catch(e){
          res.status(400).send('Something went wrong')
      }
    }
  )

  route.post(
    '/movie/',
    async (req,res,next)=>{
      try{
        delete req.body.movieID
        const data = await movieService.insert(req.body)
        return res.send(data)
      }
      catch(e){
        res.status(400).send('Please pass the correct values for movies')
      }
    }
  )

  route.put(
    '/movie/',
    async (req,res,next)=>{
      try{
        const data = await movieService.update(req.body)
        res.send(data)
      }
      catch(e){
        res.status(400).send('Please pass the correct values for movies')
      }
    }
  )


   route.delete(
    '/movie/:movieID',
    async (req,res,next)=>{
       try {
        await movieService.deleteFromAPI(req.params.movieID);
        res.send(true);
      } catch (e) {
        console.log(e)
        return res.status(404).send("The Movie with the given ID was not found.");
      }
    }
  )

   route.get(
    '/genre/',
    async (req,res,next)=>{
      try{
        const data = await genreService.getAll()
        res.send(data)
      }
      catch(e){
          res.status(400).send('Something went wrong')
      }
    }
  )

route.post(
    '/register/',
    async (req, res, next) => {
      try {
        console.log(req.body)
        if (await employeeService.checkUserName(req.body.userName)) 
          return res.status(401).send("User name is note available, plese chose another one.");
        const resData = await employeeService.insertAPI({
          ...req.body,
        });
        return res.send(resData);
      } catch (e) {
        //console.log(e)
        next(e);
      }
    },
  );

  route.post(
    '/auth/',
    async (req, res, next) => {
      try {
        //console.log(req.body)
        const { userName } = req.body;
        const { password } = req.body;
        const employee = await employeeService.getUserName(userName);
        if(!employee) 
          return res.status(401).send("Employee not registerd, please try again!");
        const passwordHash = await Utils.crypto.getHash(password, employee.passwordSalt);
        if(employee.password === passwordHash) {
          req.session.userName = userName;
          employee.lastLoggedIn = Date.now();
          await employee.save();
          //return res.send(employee);
          //console.log(appConfig.JWT_SECRET)
          const token = jwt.sign({ employee }, appConfig.JWT_SECRET, {
            expiresIn: "1h",
          });
          return res.send(token)
        }
        return res.status(401).send("Username or password is wrong, please try again !");
      } catch (e) {
        //console.log(e)
        next(e);
      }
    },
  );

  return route;
};
