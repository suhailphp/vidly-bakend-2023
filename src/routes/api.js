const { Router } = require('express');

const route = Router();


const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ApplicationError,
} = require('../modules/error');

const GrenreService = require('../services/genre');
const MovieService = require('../services/movie');
const { log } = require('console');

const moduleName = 'movie';

module.exports = (app) => {
  app.use('/api', route);
  const genreService = new GrenreService();
  const movieService = new MovieService();

   //here is the code for api

  route.get(
    '/movie/',
    async (req,res,next)=>{
      const data = await movieService.getAll()
      res.send(data)
    }
  )

   route.delete(
    '/movie/:movieID',
    async (req,res,next)=>{
       try {
        await movieService.deleteFromAPI(req.params.movieID);
        res.send(true);
      } catch (e) {
        return res.status(404).send("The Movie with the given ID was not found.");
      }
    }
  )

   route.get(
    '/genre/',
    async (req,res,next)=>{
      const data = await genreService.getAll()
      res.send(data)
    }
  )

  //end the code for api

  return route;
};
