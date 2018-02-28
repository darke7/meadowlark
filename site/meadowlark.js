let express = require('express');
let app = express();
let fortune = require('./lib/fortune');

//设置handlebars模板引擎
let handlebars = require('express3-handlebars').create({
	defaultLayout:'main',
	helpers:{
		section(name,options){	//模拟段落的辅助方法
			if(!this._sections){
				this._sections = {};
			}
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

//设置端口
app.set('port',process.env.PORT||3000);

//禁用包含服务器 类型或详细信息 的响应头 
app.disable('x-powered-by');
//是否开启视图缓存，一般开发模式下禁用，生产环境下启用
// app.set('view cache',true);

//天气组件的中间件
app.use((req,res,next)=>{
	if(!res.locals.partials){
		res.locals.partials = {};
	}
	res.locals.partials.weather = getWeatherData();
	next();
});

//开启测试模式
app.use((req,res,next)=>{
	res.locals.showTests = app.get('env') != 'production' && req.query.test === '1';
	next();
});

//静态资源中间件
app.use(express.static(__dirname+'/public'));

//首页
app.get(['','/home','/home.html'],(req,res)=>{
	res.render('home');
});

//关于页
app.get(['/about','/about.html'],(req,res)=>{
	res.render('about',{
		fortune:fortune(),
		pageTestScript:'/qa/tests-about.js'
	});
});

//段落测试页
app.get(['/jquerytest','/jquerytest.html'],(req,res)=>{
	res.render('jquerytest');
});

//客户端模版页
app.get(['/nursery-rhyme','/nursery-rhyme.html'],(req,res)=>{
	res.render('nursery-rhyme');
});//客户端模版页json数据
app.get(['/data/nursery-rhyme','/data/nursery-rhyme.html'],(req,res)=>{
	res.json({
		animal:'squirrel',
		bodyPart:'tail',
		adjective:'bushy',
		noun:'heck'
	});
});

//定制404页面
app.use((req,res)=>{
	res.status(404);
	res.render('404');
});

//定制500页面
app.use((err,req,res)=>{
	console.log(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'),()=>{
	console.log(`Express started on http://localhost:${app.get('port')}`);
});



let getWeatherData = ()=>{
	return {
		locations:[
			{
				name:'Portland',
				forecastUrl:'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl:'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather:'Overcast',
				temp:'54.1 F (12.3 C)'
			},
			{
				name:'Bend',
				forecastUrl:'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl:'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather:'Partly Cloudy',
				temp:'55.0 F (12.8 C)'
			},
			{
				name:'Manzanita',
				forecastUrl:'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl:'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather:'Light Rain',
				temp:'55.0 F (12.8 C)'
			}
		]
	};
}