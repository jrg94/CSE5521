//We will be using the Numeric Javascript library for matrix,vector math
//Some functions you will need:
// numeric.add(a,b) : add two matrices or vectors together
// numeric.mul(a,b) : multiply a matrix or vector by a scalar
//                    (also, element-wise multiplication, but you won't need that)
// numeric.dot(a,b) : matrix-matrix or matrix-vector multiply
//					  (this is the one you will be using most! NOT mul() )
// numeric.transpose(a) : matrix transpose
// numeric.solve(M,b) : solve for and return vector x from M*x=b
//                      equivalently, return (M^-1)*b
// numeric.inv(M) : Find the inverse M^-1 of matrix M
//                  (Using solve() is generally more efficient than this, but you can use
//                   this if you find it less confusing.)
// console.log(numeric.prettyPrint(M)) : (Nicely) print matrix M to the console
// For a full reference, see: numericjs.com/documentation.html IN THE ZIP FILE

//Some notes on working with vectors and matrices:
//  Vectors are simple arrays. For example, use x[i] to access the i'th element of vector x.
//  Matrices are accessed in ROW-COLUMN fashion.
//    For example, use M[j][i] to access the element at COLUMN i and ROW j of matrix M.

//////////////////////////////////////////////////////////////////////////////

/**
 * Solves for p given A and b.
 * 
 * @param {Array} A the A matrix 
 * @param {Array} b the b matrix
 * @returns p
 */
function solveForParams(A, b) {
  let ATranspose = numeric.transpose(A)
  let AProduct = numeric.dot(ATranspose, A)
  let AProductInverse = numeric.inv(AProduct)
  let AProductInverseTranspose = numeric.dot(AProductInverse, ATranspose)
  let p = numeric.dot(AProductInverseTranspose, b)
  return p
}

/**
 * Perform linear least squares for line equation: y=a*x+b
 * 
 * @param {Array} data a list of data points
 * @returns parameter array p, where p[0]=b and p[1]=a
 */
function calc_linLSQ_line(data) {
  let N = numeric.dim(data)[0]; // Number of data points
  let x = squeeze_to_vector(numeric.getBlock(data, [0, 0], [N - 1, 0])); // Extract x (dependent) values
  let y = squeeze_to_vector(numeric.getBlock(data, [0, 1], [N - 1, 1])); // Extract y (target) values

  // Setup matrices/vectors for calculation
  let A = numeric.rep([N, 2], 0); // Make an empty (all zero) Nx2 matrix
  let b = numeric.rep([N], 0); // Make an empty N element vector
  for (let i = 0; i < N; ++i) {
    A[i][0] = 1;
    A[i][1] = x[i];
    b[i] = [y[i]];
  }

  let p = solveForParams(A, b)

  let sse = 0;
  for (let i = 0; i < N; ++i) {
    let model_out = eval_line_func(x[i], p); // The output of the model function on data point i using parameters p
    sse += Math.pow((model_out - b[i][0]), 2)
  }
  helper_log_write("SSE=" + sse);

  return p;
}

/**
 * Perform linear least squares for polynomial
 * (example: for quadratic a*x^2+b*x+c, order=2, p[0]=c, p[1]=b, p[2]=a)
 * 
 * @param {Array} data list of data points
 * @param {Number} order the order of the polynomial
 * @returns parameter array p, where p[0] is the constant term and p[order] holds the highest order coefficient
 */
function calc_linLSQ_poly(data, order) {
  let N = numeric.dim(data)[0];
  let x = squeeze_to_vector(numeric.getBlock(data, [0, 0], [N - 1, 0])); // Extract x (dependent) values
  let y = squeeze_to_vector(numeric.getBlock(data, [0, 1], [N - 1, 1])); // Extract y (target) values

  let A = numeric.rep([N, order + 1], 0);
  let b = numeric.rep([N], 0);
  for (let i = 0; i < N; ++i) {
    for (let j = 0; j <= order; j++) {
      A[i][j] = Math.pow(x[i], j)
    }

    b[i] = [y[i]];
  }

  let p = solveForParams(A, b)

  let sse = 0;
  for (let i = 0; i < N; ++i) {
    let model_out = eval_poly_func(x[i], p); // The output of the model function on data point i using parameters p
    sse += Math.pow((model_out - b[i][0]), 2)
  }
  helper_log_write("SSE=" + sse);

  return p;
}

/**
 * Calculate jacobian matrix for a*x^b+c*x+d
 * 
 * @param {Array} data list of data points
 * @param {Array} p list of parameters, where p[0]=d,...,p[3]=a
 * @returns Jacobian matrix
 */
function calc_jacobian(data, p) {
  let N = numeric.dim(data)[0];
  let x = squeeze_to_vector(numeric.getBlock(data, [0, 0], [N - 1, 0])); // Extract x (dependent) values

  let J = numeric.rep([N, 4], 0);
  for (let i = 0; i < N; ++i) {
    J[i][3] = Math.pow(x[i], p[2]); // df(x, p) / da = x ^ b
    J[i][2] = p[3] * Math.pow(x[i], p[2]) * Math.log(x[i]);  // df(x, p) / db = a * x^b * log(x)
    J[i][1] = x[i]; // df(x, p) / dc = x
    J[i][0] = 1; // 1
  }

  return J;
}

/**
 * Perform Gauss-Newton non-linear least squares on polynomial a*x^b+c*x+d
 * 
 * @param {Array} data list of data points
 * @param {Array} initial_p list of initial parameters
 * @param {Number} max_iterations number of iterations to perform before stopping
 * @returns final parameter array p, where p[0]=d,...,p[3]=a
 */
function calc_nonlinLSQ_gaussnewton(data, initial_p, max_iterations) {
  let N = numeric.dim(data)[0];
  let x = squeeze_to_vector(numeric.getBlock(data, [0, 0], [N - 1, 0])); //Extract x (dependent) values
  let y = squeeze_to_vector(numeric.getBlock(data, [0, 1], [N - 1, 1])); //Extract y (target) values

  let p = initial_p.slice(0); //Make a copy, just to be safe
  let dy = numeric.rep([N], 0);
  for (let iter = 0; iter <= max_iterations; ++iter) {
    //Step 1: Find error for current guess
    for (let i = 0; i < N; ++i) {
      dy[i] = y[i] - eval_nonlin_func(x[i], p);
    }

    let sse = 0;
    for (let i = 0; i < N; ++i) {
      sse += Math.pow(dy[i], 2)
    }
    helper_log_write("Iteration " + iter + ": SSE=" + sse);
    if (iter == max_iterations) break; //Only calculate SSE at end

    //Step 2: Find the Jacobian around the current guess
    let J = calc_jacobian(data, p);

    //Step 3: Calculate change in guess
    let dp = solveForParams(J, dy);

    //Step 4: Make new guess
    p = numeric.add(p, dp);
  }
  return p;
}

//////////////////////////////////////////////////////////////////////////////

//Peform Gradient Descent non-linear least squares on polynomial a*x^b+c*x+d
//initial_p: contains initial guess for parameter values
//max_iterations: number of iterations to perform before stopping
//learning_rate: the learning rate (alpha) value to use
//return parameter array p, where p[0]=d,...,p[3]=a
function calc_nonlinLSQ_gradientdescent(data, initial_p, max_iterations, learning_rate) {
  let N = numeric.dim(data)[0];
  let x = squeeze_to_vector(numeric.getBlock(data, [0, 0], [N - 1, 0])); //Extract x (dependent) values
  let y = squeeze_to_vector(numeric.getBlock(data, [0, 1], [N - 1, 1])); //Extract y (target) values

  let p = initial_p.slice(0);
  let dy = numeric.rep([N], 0);
  for (let iter = 0; iter <= max_iterations; ++iter) {
    //Note: You may find putting some code here, instead of with "Step 1", will make it
    //easier to calculate SSE. This is perfectly fine.

    let sse = 0;
    /***********************
    * TASK: Calculate SSE for each iteration
    *
    * Hint: Reuse/modify your code from previous problems
    */
    helper_log_write("Iteration " + iter + ": SSE=" + sse);
    if (iter == max_iterations) break; //Only calculate SSE at end

    //Step 1: Compute gradient
    /***********************
    * TASK: Compute gradient
    *
    * See slide 24.
    *
    * Hint: You should be able to reuse some code here!
    */
    //let grad=??;

    //Step 2: Update parameters
    /***********************
    * TASK: Update parameters
    *
    * See slide 23.
    */
    //p=??;
  }
  return p;
}
