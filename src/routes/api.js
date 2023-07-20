const { Router } = require('express');
const route = Router();
const GrenreService = require('../services/genre');
const MovieService = require('../services/movie');
const EmployeeService = require('../services/employee');
const moduleName = 'api';

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
    '/employee/',
    async (req, res, next) => {
      try {
        if (await employeeService.checkUserName(req.body.userName)) { 
          return res.status(401).send("User name is note available, plese chose another one.");
        }
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

  return route;
};
