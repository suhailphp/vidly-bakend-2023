const { Router } = require('express');
const route = Router();
const GrenreService = require('../services/genre');
const MovieService = require('../services/movie');
const moduleName = 'api';

module.exports = (app) => {

  app.use('/api', route);
  const genreService = new GrenreService();
  const movieService = new MovieService();

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
        const data = await movieService.insert(req.body)
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
  return route;
};
