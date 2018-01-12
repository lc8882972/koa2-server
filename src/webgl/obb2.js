const THREE = require('three')

const { Vector3, Matrix3 } = THREE;

export default function OBB() {
	let position = new Vector3();
	let orientation = new Matrix3();
	let halfExtents = new Vector3();
	let max = new Vector3();
	let min = new Vector3();
	const INV_SQRT_TWO = 0.707106781;

	/**
	 * 
	 * @param {Array} vertices 
	 */
	function factoryOBB(vertices) {

		let eValue = [];
		let eVectors = [
			new Vector3(),
			new Vector3(),
			new Vector3()
		];
		let covariance = new Matrix3();
		let axis = new Vector3();

		for (let i = 0; i < vertices.length; i++) {
			position.add(vertices[i]);
		}

		position.divideScalar(vertices.length);

		covariance = computeCovarianceMatrix(vertices);

		jacobiSolver(covariance, eValue, eVectors);

		let temp = 0;
		let tempVec = new Vector3();

		schmidtOrthogonal(eVectors[0], eVectors[1], eVectors[2]);

		orientation.elements[0] = eVectors[0].x;
		orientation.elements[1] = eVectors[0].y;
		orientation.elements[2] = eVectors[0].z;
		orientation.elements[3] = eVectors[1].x;
		orientation.elements[4] = eVectors[1].y;
		orientation.elements[5] = eVectors[1].z;
		orientation.elements[6] = eVectors[2].x;
		orientation.elements[7] = eVectors[2].y;
		orientation.elements[8] = eVectors[2].z;

		let minExtents = new Vector3(Infinity, Infinity, Infinity);
		let maxExtents = new Vector3(-Infinity, -Infinity, -Infinity);
		let displacement;
		for (let index = 0; index < vertices.length; index++) {
			let vec = vertices[index].clone();
			displacement = vec.sub(position);

			minExtents.x = Math.min(minExtents.x, displacement.dot(eVectors[0]));
			minExtents.y = Math.min(minExtents.y, displacement.dot(eVectors[1]));
			minExtents.z = Math.min(minExtents.z, displacement.dot(eVectors[2]));

			maxExtents.x = Math.max(maxExtents.x, displacement.dot(eVectors[0]));
			maxExtents.y = Math.max(maxExtents.y, displacement.dot(eVectors[1]));
			maxExtents.z = Math.max(maxExtents.z, displacement.dot(eVectors[2]));

		}

		max.copy(maxExtents);
		min.copy(minExtents);

		//offset = (maxExtents-minExtents)/2.0f+minExtents 
		let offset = maxExtents.clone();
		offset.sub(minExtents);
		offset.divideScalar(2);
		offset.add(minExtents);

		position.add(eVectors[0].clone().multiplyScalar(offset.x));
		position.add(eVectors[1].clone().multiplyScalar(offset.y));
		position.add(eVectors[2].clone().multiplyScalar(offset.z));

		halfExtents.x = (maxExtents.x - minExtents.x) / 2;
		halfExtents.y = (maxExtents.y - minExtents.y) / 2;
		halfExtents.z = (maxExtents.z - minExtents.z) / 2;


	}

	function computeCovarianceMatrix(pVertices) {
		let covariance = new Matrix3();
		// let tArray = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
		let pVectors = [];
		let data = [];
		//Compute the average x,y,z
		let avg = new Vector3();
		for (let i = 0; i < pVertices.length; i++) {
			pVectors[i] = pVertices[i].clone();
			avg.add(pVertices[i]);
		}

		avg.divideScalar(pVertices.length);

		for (let i = 0; i < pVertices.length; i++) {
			pVectors[i].sub(avg);
		}

		//Compute the covariance 
		for (let c = 0; c < 3; c++) {

			for (let r = c; r < 3; r++) {
				covariance.elements[c * 3 + r] = 0;
				tArray[c][r] = 0;
				let acc = 0;
				//cov(X,Y)=E[(X-x)(Y-y)]

				for (let i = 0; i < pVertices.length; i++) {
					data[0] = pVectors[i].x;
					data[1] = pVectors[i].y;
					data[2] = pVectors[i].z;
					acc += data[c] * data[r];
				}

				acc /= pVertices.length;
				covariance.elements[c * 3 + r] = acc;
				//symmetric
				covariance.elements[r * 3 + c] = acc;
				// 0,0  x * x , + x * x, x * x 
				// 0,1  x * y  
				// 0,2  x * z

				// 1,1  y * y , + x * x, x * x 
				// 1,2  y * z

				// 2,2  z * z
			}

		}

		console.log(tArray);
		console.log(covariance.elements)
		return covariance;

	}

	//Schmidt orthogonal
	/**
	 * 
	 * @param {THREE.Vector3} v0 
	 * @param {THREE.Vector3} v1 
	 * @param {THREE.Vector3} v2 
	 */
	function schmidtOrthogonal(v0, v1, v2) {
		v0.normalize();
		//v1-=(v1*v0)*v0;
		v0.multiplyScalar(v1.clone().dot(v0));
		v1.sub(v0);
		v1.normalize();
		v2.crossVectors(v0, v1);
	}

	/**
	 * Compute the eigenvalues and eigenvectors by using Jacobi method
	 * @param {THREE.Matrix3} matrix 
	 * @param {Number} eValue 
	 * @param {Array<THREE.Vector3>} eVectors 
	 */
	function jacobiSolver(matrix, eValue, eVectors) {
		let eps1 = 0.00001;
		let eps2 = 0.00001;
		let eps3 = 0.00001;

		let p, q, spq;
		let cosa = 0, sina = 0;  //cos(alpha) and sin(alpha)
		let temp;
		let s1 = 0;    //sums of squares of diagonal
		let s2;          //elements

		let flag = true;  //determine whether to iterate again
		// let iteration = 0;   //iteration counter

		let mik = new Vector3();//used for temporaty storage of m[i][k]
		let data = [];
		let t = new Matrix3().identity();//To store the product of the rotation matrices.

		do {
			for (let i = 0; i < 2; i++) {
				for (let j = i + 1; j < 3; j++) {
					if (Math.abs(matrix.elements[j * 3 + i]) < eps1) {
						matrix.elements[j * 3 + i] = 0;
					}
					else {
						q = Math.abs(matrix.elements[i * 3 + i] - matrix.elements[j * 3 + j]);
						if (q > eps2) {
							p = (2 * matrix.elements[j * 3 + i] * q) / (matrix.elements[i * 3 + i] - matrix.elements[j * 3 + j]);
							spq = Math.sqrt(p * p + q * q);
							cosa = Math.sqrt((1 + q / spq) / 2);
							sina = p / (2 * cosa * spq);
						}
						else
							sina = cosa = INV_SQRT_TWO;

						for (let k = 0; k < 3; k++) {
							temp = t.elements[i * 3 + k];
							t.elements[i * 3 + k] = temp * cosa + t.elements[j * 3 + k] * sina;
							t.elements[j * 3 + k] = temp * sina - t.elements[j * 3 + k] * cosa;
						}


						for (let k = i; k < 3; k++) {
							if (k > j) {
								temp = matrix.elements[k * 3 + i];
								matrix.elements[k * 3 + i] = cosa * temp + sina * matrix.elements[k * 3 + j];
								matrix.elements[k * 3 + j] = sina * temp - cosa * matrix.elements[k * 3 + j];

							}
							else {
								data[k] = matrix.elements[k * 3 + i];
								matrix.elements[k * 3 + i] = cosa * data[k] + sina * matrix.elements[j * 3 + k];
								if (k == j)
									matrix.elements[k * 3 + j] = sina * data[k] - cosa * matrix.elements[k * 3 + j]
							}
						}

						data[j] = sina * data[i] - cosa * data[j];

						for (let k = 0; k <= j; k++) {
							if (k <= i) {
								temp = matrix.elements[i * 3 + k];
								matrix.elements[i * 3 + k] = cosa * temp + sina * matrix.elements[j * 3 + k];
								matrix.elements[j * 3 + k] = sina * temp - cosa * matrix.elements[j * 3 + k];

							}
							else
								matrix.elements[j * 3 + k] = sina * data[k] - cosa * matrix.elements[j * 3 + k];
						}
					}
				}
			}
			s2 = 0;
			for (let i = 0; i < 3; i++) {
				eValue[i] = matrix.elements[i * 3 + i];
				s2 += eValue[i] * eValue[i];
			}

			if (Math.abs(s2) < 1.e-5 || Math.abs(1 - s1 / s2) < eps3)
				flag = false;
			else
				s1 = s2;
		} while (flag);

		eVectors[0].x = t.elements[0];
		eVectors[0].y = t.elements[1];
		eVectors[0].z = t.elements[2];
		eVectors[1].x = t.elements[3];
		eVectors[1].y = t.elements[4];
		eVectors[1].z = t.elements[5];
		eVectors[2].x = t.elements[6];
		eVectors[2].y = t.elements[7];
		eVectors[2].z = t.elements[8];

		mik.x = data[0];
		mik.y = data[1];
		mik.z = data[2];
		let cross = new Vector3();

		cross.crossVectors(eVectors[0], eVectors[1]);
		if (cross.dot(eVectors[2]) < 0) {
			eVectors[2].negate();
		}

	}

	return {
		factoryOBB,
		position,    // 中心点
		orientation, // 方向 x y z
		halfExtents, // 3个1/2边长,半长、半宽、半高
		max,
		min
	}
}

