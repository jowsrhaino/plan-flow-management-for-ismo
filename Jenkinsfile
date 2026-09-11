pipeline {
  agent any
  environment { REGISTRY = credentials('docker-registry'); IMAGE_TAG = "${BUILD_NUMBER}" }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Frontend build') { steps { dir('frontend') { sh 'npm ci && npm run build' } } }
    stage('Backend checks') { steps { dir('backend') { sh 'node --check src/server.js && node --check src/controllers/integrationController.js' } } }
    stage('Build images') { steps { sh 'docker build -t $REGISTRY/planflow-api:$IMAGE_TAG backend && docker build -t $REGISTRY/planflow-web:$IMAGE_TAG frontend' } }
    stage('Push images') { steps { sh 'docker push $REGISTRY/planflow-api:$IMAGE_TAG && docker push $REGISTRY/planflow-web:$IMAGE_TAG' } }
    stage('Deploy') { steps { withKubeConfig([credentialsId: 'kubeconfig-planflow']) { sh 'sed -e "s|REGISTRY|$REGISTRY|g" -e "s|IMAGE_TAG|$IMAGE_TAG|g" k8s/deployment.yaml | kubectl apply -f -' } } }
  }
}
