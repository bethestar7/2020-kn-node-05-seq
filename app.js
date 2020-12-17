const express = require('express');
const path = require('path');
const app = express();

// 시퀄라이즈가 가진 객체들 가져오기
const { Sequelize, DataTypes } = require('sequelize');


app.listen(3000, () => {
  console.log('http://127.0.0.1:3000');
});

app.set('view engine', 'pug');
// 뷰 페이지의 폴더 기본 경로로 __dirname + views 이름의 폴더를 사용하겠다는 의미
app.set('views', path.join(__dirname, 'views'));
app.locals.pretty = true;

// req.body 를 parsing 하게 하기
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// 객체 인스턴스 생성
// 시퀄라이즈 객체에 접속 정보를 주게 되면 시퀄라이즈 객체가 알아서 디비 접속 준비를 끝낸다
const sequelize = new Sequelize({
  host: 'localhost',
  port: 3306,
  database: 'boraming',
  username: 'boraming',
  password: '000000',
  dialect: 'mysql',
  pool: { max: 10 } // createPool
  //dialect 는 어떤 db를 쓸 것인지 명시하는 것. 시퀄라이즈는 여러 db 들을 통합해서 짜는 것이 가능하기 때문 (mariadb, mssql, mysql 등등) 대신 느림
});


// 시퀄라이즈 사용법 2개
// http://sequelize.org/master/manual/model-basics.html

// 방법1 
// class SeqBoard extends Model {}

// 방법2
const Sample = sequelize.define('Sample', { //인자: 모델명, 속성(객체로)('sample'이라는 모델의 필드명을 정의), 옵션
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  writer: {
    type: DataTypes.STRING(20)
  },
  comment: {
    type: DataTypes.TEXT()
  }
}, {
  charset: 'utf8',
  tableName: 'seq-sample2'
}); 

sequelize.sync(); // 위에서 define된 sequlize 객체를 sync 메서드를 써줌으로써 디비가 생성됨


/*
app.get('/', (req, res, next) => {
  res.send('<h1>Hello Sequelize</h1>');
});
*/

app.get('/write', (req, res, next) => {
  res.render('write.pug');
});

app.post('/save', async (req, res, next) => {
  let { title, writer, comment } = req.body;
  try {
    let result = await Sample.create({ title, writer, comment }); //혹은 ...req.body 도 가능(72번줄 필요없음)
    res.redirect('/list');
  }
  catch(e) {
    console.log(e);
  }
});

app.get('/create', async (req, res, next) => {
  try {
    let result = await Sample.create({ // 위에서 만든 Sample 객체(데이터모델)에 create() 메서드를 사용하여 데이터 생성
      title: '구운몽전',
      writer: '구운몽',
      comment: '한여름 나비가...'
    });
    res.json(result);
  }
  catch(e) {
    console.log(e);
  }
});

app.get(['/', '/list'], async (req, res, next) => {
  try {
    let result = await Sample.findAll({ // Sample 객체에 findAll() 메서드를 사용하여 데이터 모두 가져오기
      order: [['id', 'desc']], //리스트 순서 옵션 
      //offset: 0,
      //limit: 5   // 보통 limit: (0, 5) 라고 씀 (0부터 5개 가져와)
    });
    res.render('list.pug', { result });
  }
  catch(e) {
    console.log(e);
  }
});

app.get('/update/:id', async (req, res, next) => { // Sample 객체에 findOne() 메서드를 사용하여 데이터 하나만 가져오기
  let id = req.params.id;
  let v = await Sample.findOne({ where: { id }}); // 'id': id
  res.render('update', { v });
});

app.post('/saveUpdate', async (req, res, next) => {
  let { id, title, writer, comment } = req.body;
  let result = await Sample.update({ title, writer, comment }, { where: { id }});
  // update() 메서드 인자: 데이터, where절
  res.redirect('/');
});

app.get('/remove/:id', async (req, res, next) => {
  let id = req.params.id;
  let result = await Sample.destroy({ where: { id } });
  res.redirect('/');
});