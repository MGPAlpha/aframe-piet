var vectorOp = function(op, vec1, vec2) {
    out = {};
    if (typeof(vec2) === "number") vec2 = {x: vec2, y: vec2, z: vec2};
    if (!vec2) vec2 = {x: 0, y: 0, z: 0};
    out.x = op(vec1.x, vec2.x);
    out.y = op(vec1.y, vec2.y);
    out.z = op(vec1.z, vec2.z);
    return out;
}

var vectorLength = function(vec) {
    return Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
}

var normalize = function(vec) {
    return vectorOp((val1,val2) => val1/val2, vec, vectorLength(vec));
}

var vectorLerp = function(vec1, vec2, t) {
    return vectorOp((val1, val2) => val1 + t * (val2 - val1), vec1, vec2);
}

var vectorClampLerp = function(vec1, vec2, t) {
    return vectorLerp(vec1, vec2, Math.max(0,Math.min(1,t)));
}

var moveTowards = function(val, target, t) {
    if (Math.abs(target - val) < t) return target;
    if (target > val) return val + t;
    return val - t;
}

var exploders = [];

AFRAME.registerComponent('shrinker', {
    schema: {
        
    },

    init: function () {
        let scale = this.el.components.scale.data
      this.el.setAttribute("scale", {x: scale.x - .2, y: scale.y - .2, z: scale.z});
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});


AFRAME.registerComponent('exploder', {
    schema: {},
    init: function () {
        exploders.push(this);
        this.exploded = false;
        this.explosionTime = 1.5;
        this.explosionTimer = 0;
        this.defaultPosition = {};
        this.defaultRotation = {};
        Object.assign(this.defaultPosition, this.el.components.position.data);
        Object.assign(this.defaultRotation, this.el.components.rotation.data);
        // console.log(this.explodedPosition);
    },
    update: function () {},
    tick: function (time, timeDelta) {
        
        if (this.exploded) {
            this.explosionTimer = moveTowards(this.explosionTimer, this.explosionTime, timeDelta/1000);
        } else {
            this.explosionTimer = moveTowards(this.explosionTimer, 0, timeDelta/1000);
        }
        this.el.setAttribute("position", vectorClampLerp(this.defaultPosition, this.explodedPosition, Math.sin(this.explosionTimer / this.explosionTime * 2 * Math.PI / 4)));
        this.el.setAttribute("rotation", vectorClampLerp(this.defaultRotation, this.explodedRotation, Math.sin(this.explosionTimer / this.explosionTime * 2 * Math.PI / 4)));
    },
    remove: function () {},
    pause: function () {},
    play: function () {},

    explode: function() {
        // this.explodedPosition = {x: Math.random(), y: Math.random(), z: Math.random()};
        // this.explodedPosition = vectorOp((arg) => arg * 2 - 1, this.explodedPosition);
        this.exploded = !this.exploded;
        if (this.exploded && this.explosionTimer == 0) {
            var explosionDirection = vectorOp((val1, val2) => val1 - val2, this.defaultPosition, {x: 0, y: 0, z: -3});
            explosionDirection = normalize(explosionDirection);
            explosionDirection = vectorOp((val1, val2) => val1 * val2, explosionDirection, 20);
            this.explodedPosition = vectorOp((val1, val2) => val1 + val2, explosionDirection, this.defaultPosition);
            let positionAdjustment = {x: Math.random(), y: Math.random(), z: Math.random()};
            positionAdjustment = vectorOp((val1) => val1 * 2 - 1, positionAdjustment);
            positionAdjustment = vectorOp((val1, val2) => val1 * val2, positionAdjustment, 10);
            this.explodedPosition = vectorOp((val1, val2) => val1 + val2, this.explodedPosition, positionAdjustment);
            
            this.explodedRotation = {x: Math.random(), y: Math.random(), z: Math.random()};
            this.explodedRotation = vectorOp((val1) => val1 * 720 - 360, this.explodedRotation);
        }

    }
  });

  AFRAME.registerComponent('explosion-trigger', {
      schema: {
          
      },
  
      init: function () {
        this.el.addEventListener('click', () => {
            exploders.forEach((exploder) => exploder.explode());
        });
      },
  
      update: function () {
        // Do something when component's data is updated.
      },
  
      remove: function () {
        // Do something the component or its entity is detached.
      },
  
      tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
      }
  });
  