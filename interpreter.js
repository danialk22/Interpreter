class Node {
  constructor() {
    this.next = null
  }
}

//interpExpression(state: State, e: Expr): number | boolean
function interpExpression(state, e) { 
  //checks if kind is number or boolean.
  if (e.kind === "number" || e.kind === "boolean") {
    return e.value;
  } 
  else if (e.kind === "operator") {
    let numOps = ["+", "-", "*", "/", ">", "<", "==="];
    let boolOps = ["&&", "||", "==="];
    let v1 = interpExpression(state, e.e1);
    let v2 = interpExpression(state, e.e2);

    //checks if both arguments have same type.
    if (typeof(v1) !== typeof(v2)) {
      console.log("Both arguments must be of the same type.");
      assert(false);
    }

    //checks if the operator is valid.
    else if (!numOps.includes(e.op) && !boolOps.includes(e.op)) {
      console.log("Invalid operator used.");
      assert(false);
    }

    //checks if the '===' operator is used.
    else if (e.op === "===") {
      return v1 === v2;
    }

    else if (e.op === "+" && (typeof(v1) === "string" || typeof(v1) === "number")){
      return v1 + v2;
    }

    //checks if arguments are type number for number operators.
    else if (numOps.includes(e.op) && typeof(v1) !== "number") {
      console.log("Arguments of operator " + e.op + " must both be numbers.");
      assert(false);
    }

    //checks if arguments are type boolean for boolean operators.
    else if (boolOps.includes(e.op) && typeof(v1) !== "boolean") {
      console.log("Arguments of operator " + e.op + " must both be boolean.");
      assert(false);
    }

    else if (typeof(v1) === "number") {
      if (e.op === "-") {
        return v1 - v2;
      }

      else if (e.op === "*") {
        return v1 * v2;
      }

      else if (e.op === "/") {
        if (v2 === 0) {
          return "Infinity";
        }
        else {
          return v1 / v2;
        }
      }

      else if (e.op === ">") {
        return v1 > v2;
      }

      else if (e.op === "<") {
        return v1 < v2;
      }

    }

    else if (typeof(v1) === "boolean") {
      if (e.op === "&&") {
        return v1 && v2;
      }

      else if (e.op === "||") {
        return v1 || v2;
      }
    }

  }

  //checks if kind variable.
  else if (e.kind === "variable") {
    //loop to find the state with the variable declared.
    while (state !== null) {
      if (lib220.getProperty(state,e.name).found === true) {
        //return variable value if found.
        return lib220.getProperty(state, e.name).value;
      }
      else {
        state = state.next;
      }
    }
    //error message if variable not declared.
    console.log("Variable " + e.name + " has not been declared.");
    assert(false);
  }

  else {
    console.log("Incorrect expression");
    assert(false);
  } 
}

//interpStatement(state: State, p: Stmt): void
function interpStatement(state, s) {
  if (s.kind === 'let') {
    //checks if variable already declared.
    if (lib220.getProperty(state, s.name).found === true) {
      console.log("Variable " + s.name + " declared more than once");
      assert(false);
    }
    let value = interpExpression(state, s.expression);
    lib220.setProperty(state, s.name, value); 
  }

  if (s.kind === 'assignment') {
    let declared = false;

    //checks if variable is declared before assignment.
    while (declared === false && state !== null) {
      if(lib220.getProperty(state, s.name).found === true) {
        declared = true;
      }
      else {
        state = state.next;
      }
    }
    //error message if variable not declared.
    if (declared === false) {
      console.log("Variable " + s.name + " assigned value before being declared.");
      assert(false);
    }
    else {
      let value = interpExpression(state, s.expression);
      lib220.setProperty(state, s.name, value); 
    }
  }

  else if (s.kind === 'if') {
    let value = interpExpression(state, s.test);
    if (value) {
      interpBlock(state, s.truePart);
    } 
    else {
      interpBlock(state, s.falsePart);
    }
  }

  else if (s.kind === 'while') {
    while (interpExpression(state, s.test)) {
      interpBlock(state, s.body);
    }
  }

  else if (s.kind === "print") {
    console.log(interpExpression(state, s.expression));
  }
}

//interpBlock(state: State, b:Stmt[]): void
function interpBlock(state, b) {
  let head = new Node();
  head.next = state;
  for (let i = 0; i < b.length; ++i) {
    interpStatement(head, b[i]);
  }
}

//interpProgram(p: Stmt[]): State
function interpProgram(p) {
  let state = new Node();
  for (let i = 0; i < p.length; ++i) {
    interpStatement(state, p[i]);
  }

  return state;
}

test('interpExpression works for addition.', function() {
  let p = parser.parseExpression("10+5").value;
  let ans = interpExpression({}, p);

  assert(ans === 15);

});

test('interpExpression works for subtraction.', function() {
  let p = parser.parseExpression("10-5").value;
  let ans = interpExpression({}, p);

  assert(ans === 5);

});

test('interpExpression works for multiplication.', function() {
  let p = parser.parseExpression("10*5").value;
  let ans = interpExpression({}, p);

  assert(ans === 50);

});

test('interpExpression works for division.', function() {
  let p = parser.parseExpression("10/5").value;
  let ans = interpExpression({}, p);

  assert(ans === 2);

});

test('interpExpression works for addition with variables.', function() {
  let p = parser.parseExpression("x+5").value;
  let ans = interpExpression({x:10}, p);

  assert(ans === 15);

});

test('interpExpression works for subtraction with variables.', function() {
  let p = parser.parseExpression("x-5").value;
  let ans = interpExpression({x:10}, p);

  assert(ans === 5);

});

test('interpExpression works for multiplication with variables.', function() {
  let p = parser.parseExpression("x*5").value;
  let ans = interpExpression({x:10}, p);

  assert(ans === 50);

});

test('interpExpression works for division with variables.', function() {
  let p = parser.parseExpression("x/5").value;
  let ans = interpExpression({x:10}, p);

  assert(ans === 2);

});

test('interpExpression works with booleans for &&', function() {
  let p1 = parser.parseExpression("true && false").value;
  let ans1 = interpExpression({}, p1);

  let p2 = parser.parseExpression("true && true").value;
  let ans2 = interpExpression({}, p2);

  assert(ans1 === false);
  assert(ans2 === true);

});

test('interpExpression works with booleans for ||', function() {
  let p1 = parser.parseExpression("false || false").value;
  let ans1 = interpExpression({}, p1);

  let p2 = parser.parseExpression("true || true").value;
  let ans2 = interpExpression({}, p2);

  assert(ans1 === false);
  assert(ans2 === true);

});

test("declaration", function() {
  let st = interpProgram(parser.parseProgram("let x = 20; let y = 10;").value);
  assert(st.x === 20);
  assert(st.y === 10);
});

test("assignment", function() {
  let st = interpProgram(parser.parseProgram("let x = 20; let y = 10; x = 10; y = 20;").value);
  assert(st.x === 10);
  assert(st.y === 20);
});

test("if", function() {
  let st = interpProgram(parser.parseProgram("let x = 20; if(x===20){x=0;} else{}").value);
  assert(st.x === 0);
});

test("else", function() {
  let st = interpProgram(parser.parseProgram("let x = 20; if(x===10){x=1;} else{x=0;}").value);
  assert(st.x === 0);
});

test("while", function() {
  let st = interpProgram(parser.parseProgram("let i = 0; while(i<10){ i=i+1;}").value);
  assert(st.i === 10);
});

test("factorial", function() {
  let st = interpProgram(parser.parseProgram("let x = 5; let i = 1; let ans = i; while (i < x+1) { ans = ans * i; i = i+1;}").value);
  assert(st.ans === 120);
  assert(st.i === 6);
  assert(st.x === 5);
});
