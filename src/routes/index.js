const { Router } = require('express');
const breadcrumbs = require('../utilities/breadcrumbs');
const CourseService = require('../services/course');
const CourseDepartmentService = require('../services/courseDepartment');
const { log } = require('handlebars');
const appConfig = require('../config');
const { gatekeeper } = require('../middlewares/index');


const route = Router();
// const { v2: { logger } } = require('psa-module');
const moduleName = 'Dashboard';

module.exports = (app) => {
  app.use('/', route);
const courseService = new CourseService()
const courseDepartmentService = new CourseDepartmentService();

  route.get(
    '/',
    async (req, res, next) => {
      try {
        const data = {
          title: req.__('Home'),
          breadcrumb: breadcrumbs.init().add(req.__('Employee profile')),
        };
        data.data = await courseService.getCounts(req.Employee.employeeID)
        res.render('home/main', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/internal',
    async (req, res, next) => {
      try {
        const data = {
          layout:null,
        };
        data.data = await courseService.getActive(courseType = 'internal',req.Employee.employeeID)
        data.courseCount = data.data.length
        res.render('home/internal', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/external',
    async (req, res, next) => {
      try {
        const data = {
          layout:null
        };
        let allCourse = await courseService.getActive(courseType = 'external',req.Employee.employeeID)
        data.courseCount = allCourse.length

        data.courseDepartment = [{
          courseDepartmentID : 'all',
          nameEn:'All Course',
          nameAr:'كل بالطبع',
          courseCount: allCourse.length,
          course: allCourse,
          active:true
        }]
        let courseDepartment = await courseDepartmentService.getAll()
        for(let i=0;i<courseDepartment.count;i++){
          let currentCD = courseDepartment.rows[i]
          let course = await courseService.getActiveByCD(currentCD.courseDepartmentID,req.Employee.employeeID)
          currentCD.courseCount = course.length
          currentCD.course = course
          data.courseDepartment.push(currentCD)
        }
        res.render('home/external', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/owerview',
    async (req, res, next) => {
      try {
        const data = {
          layout:null,
        };
        data.data = await courseService.getCounts(req.Employee.employeeID)

        const today = new Date();
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let daysArray =[]
        for(i=3;i>0;i--){
          let pastDate = new Date();
          pastDate.setDate(today.getDate() - i);
          daysArray.push({
            date:pastDate,
            weekName:days[pastDate.getDay()],
            weekCode:days[pastDate.getDay()].substring(0, 2),
            day:pastDate.getDate(),
            isToday:false,
            data:await courseService.getDayCourse(req.Employee.employeeID,pastDate,days[pastDate.getDay()])
          })
        }
        daysArray.push({
          date:today,weekName:days[today.getDay()],
          weekCode:days[today.getDay()].substring(0, 2),
          day:today.getDate(),
          isToday:true,
          data:await courseService.getDayCourse(req.Employee.employeeID,today,days[today.getDay()])
        })
        for(i=1;i<7;i++){
          let pastDate = new Date();
          pastDate.setDate(today.getDate() + i);
          daysArray.push({
            date:pastDate,
            weekName:days[pastDate.getDay()],
            weekCode:days[pastDate.getDay()].substring(0, 2),
            day:pastDate.getDate(),
            isToday:false,
            data:await courseService.getDayCourse(req.Employee.employeeID,pastDate,days[pastDate.getDay()])
          })
        }
        //console.log(daysArray)
        data.daysArray = daysArray
        res.render('home/owerview', data);
      } catch (e) {
        next(e);
      }
    },
  );

  route.get(
    '/:courseID/courseView',
    //gatekeeper.authorization(['ADMIN', 'SUPER-ADMIN']),
    async (req, res, next) => {
      try {
        const data = { layout: null };
        data.data = await courseService.getOne(req.params.courseID);

        // console.log(data);
        if (data.data) {
          if (data.data.courseDocumentID) 
            data.bgImage = `${appConfig.BASE_URL}course/document/${req.params.courseID}`;
          else 
            data.bgImage = `${appConfig.BASE_URL}dist/assets/media/psa.png`;
          return res.render('home/courseView', data);
        } res.send(false);
      } catch (e) {
        next(e);
      }
    },
  );



  return route;
};
