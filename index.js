class SimpleCircuitBreaker {
	constructor(failureThreshold = 3) {
		this.failureCount = 0;
		this.failureThreshold = failureThreshold;
		this.circuitOpen = false;
	}

	call(service) {
		return new Promise((resolve, reject) => {
			if (this.circuitOpen) {
				return reject(new Error('Circuit Breaker is open. Cannot make the request.'));
			}

			service()
				.then((result) => {
					this.reset();
					resolve(result);
				})
				.catch((error) => {
					this.failureCount++;
					if (this.failureCount >= this.failureThreshold) {
						this.circuitOpen = true;
					}
					reject(error);
				});
		});
	}

	reset() {
		this.failureCount = 0;
		this.circuitOpen = false;
	}
}

// Simular un servicio externo que a veces falla
const simulationService = () => {
  return new Promise((resolve, reject) => {
    const randomNumber = Math.random();
    if (randomNumber > 0.5) {
      resolve('Success');
    } else {
      reject(new Error('Service failure'));
    }
  });
};

// Crear una instancia del Circuit Breaker con un umbral de fallas de 3
const simpleCircuitBreaker = new SimpleCircuitBreaker(2);

// Realizar 10 llamadas al servicio utilizando el Circuit Breaker
const makeRequests = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const result = await simpleCircuitBreaker.call(simulationService);
      console.log(`Request ${i + 1}:`, result);
    } catch (error) {
      console.error(`Request ${i + 1}:`, error.message);
    }
    // Esperar 2s antes de realizar la siguiente solicitud
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

makeRequests();
