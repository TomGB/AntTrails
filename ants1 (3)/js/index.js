function init() {
  window.requestAnimationFrame(draw);
}

mouse={
  x: 0,
  y: 0
}

canvas = document.getElementById('canvas')

canvas.addEventListener('mousemove', function(evt) {
  mouse = getMousePos(canvas, evt);
}, false);

document.addEventListener('keydown', function(evt) {
  console.log('rotate ant')
  ants[0].r+=10;
}, false);

dist = (a, b) => {
  var x = a.x - b.x
  var y = a.y - b.y

  return Math.sqrt( x*x + y*y );
}
 
getMousePos = (canvas, evt) => {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

circle = (ctx, x, y, r) => {
  ctx.beginPath()
  ctx.arc(x,y,r, 0, 2*Math.PI)
  ctx.stroke()
} 

time = 0;
antsMove = true;

foodSize = 10;

size = 800
 
numAnts = 200;

antSize = 4;
 
sensorsVisible = false;

ants = []
for (i=0; i<numAnts; i++) {
  ants.push({
    x: size/2,
    y: size/2,
    r: Math.random()*365,
    carryingFood: false,
    turnAroundCoolDown: 200,
    life: 400
  });
}

foods=[]
for (i=0; i<10; i++) {
  foods.push({
    x: Math.random() * size,
    y: Math.random() * size,
    ammount: 100
  });
}

trails=[];

function draw(e) {
 
  time++;
  
  // if (!(time % 10)) {
  //   var link = document.createElement("a");
  //   link.setAttribute("href", canvas.toDataURL("image/png"));
  //   link.setAttribute("download", `littleAnts${time/10}`);
  //   link.click();
  // }
  
  ants.forEach(ant => {
    foods.forEach(food => {
      if (
        ant.x < food.x + 10 &&
        ant.x > food.x - 10 &&
        ant.y < food.y + 10 &&
        ant.y > food.y - 10 &&
        !ant.carryingFood
      ) {
        ant.r += 180;
        ant.carryingFood = true;
        food.ammount--;
      }
    });
  });
  
  //home location
  ants.forEach(ant => {
    ant.turnAroundCoolDown--;
    
    if(dist(ant, {x:size/2, y:size/2}) < 30) {
      if (ant.carryingFood) {
        ant.carryingFood = false;
        ant.r += 180;
        console.log('ant delivered food')
      } else if (ant.turnAroundCoolDown < 0){
        // console.log('random turn around')
        // ant.r = Math.random() * 360
        // ant.turnAroundCoolDown = 200
      }
    } 
  }); 
  
  var ctx = document.getElementById('canvas').getContext('2d');

  ctx.clearRect(0,0,size,size);

  ctx.beginPath();
  ctx.arc(size/2, size/2, 30, 0,2*Math.PI);
  ctx.stroke();

  foods.forEach(food => {
    ctx.beginPath();
    ctx.arc(food.x, food.y, foodSize, 0, 2*Math.PI);
    ctx.stroke();
  })
  
  trails.forEach(trail => {
    trail.strength--;
    color =Math.floor( 255 - (trail.strength / 2000 * 255));
    ctx.save();
    ctx.fillStyle = `rgb(${color},
    ${color},
    ${color})`;
    ctx.fillRect(trail.x - 1, trail.y - 1, 2, 2);
    ctx.restore();
  });
  
  trails = trails.filter(trail => {
    return trail.strength > 0;
  });

  ants.forEach(ant => {
 
    leftCount = 0
    rightCount = 0
    
    // if(ant.carryingFood) {
    
    leftSensor = {
      x: ant.x + (antSize * Math.sin(ant.r * Math.PI/180) - (antSize * Math.cos(ant.r * Math.PI/180))),
      y: ant.y - (antSize * Math.cos(ant.r * Math.PI/180) + (antSize * Math.sin(ant.r * Math.PI/180))),
     }
    
     rightSensor = {
       x: ant.x + (antSize * Math.sin(ant.r * Math.PI/180) + (antSize * Math.cos(ant.r * Math.PI/180))),
       y: ant.y - (antSize * Math.cos(ant.r * Math.PI/180) - (antSize * Math.sin(ant.r * Math.PI/180))),
     }
    
    trails.forEach(trail => {    
        //left sensor
        if (dist(leftSensor, trail) < antSize/3*2){
          leftCount ++;
        }  
 
        //right
        if (dist(rightSensor, trail) < antSize/3*2){
          rightCount ++;
        }
     });
    if (!ant.carryingFood) {
      foods.forEach(food => {
        if(dist(leftSensor, food) < antSize/3*2 + foodSize){
          leftCount += 1000;
        }
        if (dist(rightSensor, food) < antSize/3*2 + foodSize){
          rightCount += 1000;
        }
      })
    }
   
    if(ant.carryingFood){
      if(leftCount > rightCount) {
        ant.r-=20;
      } else if(rightCount > leftCount) {
        ant.r+=20;
      }
    } else {
      if(leftCount > rightCount) {
        if(Math.random()*10 < 6) {
          ant.r-=20;
        }
      } else if(rightCount > leftCount) {
        if(Math.random()*10 < 6) {
          ant.r+=20;
        }
      }
    }
 
     if (antsMove){
       ant.x += Math.sin(ant.r * Math.PI/180);
       ant.y -= Math.cos(ant.r * Math.PI/180);

       ant.r += Math.random() * 30 - 15;
     }
    
    if(!(time % 5)){
      trails.push({
        x: ant.x,
        y: ant.y,
        strength: 1000
      });
    }
 
    ctx.save();
    ctx.translate(ant.x, ant.y);
    ctx.rotate(ant.r * Math.PI/180);

    if(ant.carryingFood){
      ctx.fillStyle = 'red';
    }
    
    if(dist(ant, mouse) < antSize/2){
      ctx.fillStyle = 'blue';
    }
    
    ctx.fillRect(-antSize/2, -antSize/2, antSize, antSize);
    
    //left sensor
    
    ctx.strokeStyle = 'black';
    
    ctx.lineWidth=2;
    
    leftSensor = {
      x: ant.x + (antSize * Math.sin(ant.r * Math.PI/180) - (antSize * Math.cos(ant.r * Math.PI/180))),
      y: ant.y - (antSize * Math.cos(ant.r * Math.PI/180) + (antSize * Math.sin(ant.r * Math.PI/180))),
    }
    
    if (dist(leftSensor, mouse) < antSize/3*2){
      ctx.strokeStyle = 'blue';
    }
    if(sensorsVisible){
      circle(ctx, -antSize, -antSize, antSize/3*2)
    }
    
    ctx.strokeStyle = 'black';
    //right
    rightSensor = {
      x: ant.x + (antSize * Math.sin(ant.r * Math.PI/180) + (antSize * Math.cos(ant.r * Math.PI/180))),
      y: ant.y - (antSize * Math.cos(ant.r * Math.PI/180) - (antSize * Math.sin(ant.r * Math.PI/180))),
    }
    
    if (dist(rightSensor, mouse) < antSize/3*2){
      ctx.strokeStyle = 'blue';
    }
    if(sensorsVisible){
    circle(ctx, antSize, -antSize, antSize/3*2)
    }
    
    ctx.strokeStyle = 'black';

    ctx.restore();
    
    if(ant.x > size) {
      ant.x = 0
    }
    if(ant.y > size) {
      ant.y = 0;
    }
    if(ant.x < 0) {
      ant.x = size
    }
    if(ant.y < 0){
      ant.y = size
    }
  });

  window.requestAnimationFrame(draw);
}

init();