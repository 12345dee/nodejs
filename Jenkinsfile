pipeline {
    agent { label 'node1' }

    tools {
        nodejs 'node18'
    }

    environment {
        SONAR_PROJECT_KEY = "nodejs-app"
        EKS_CLUSTER_NAME  = "my-eks-cluster"   // ← update once your cluster is ready
        AWS_REGION        = "us-east-1"
        DOCKER_TAG        = "${BUILD_NUMBER}"
    }

    stages {

        stage('Git Checkout') {
            steps {
                git branch: 'dev',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/12345dee/nodejs.git'
                echo "✅ Code Checkout Done"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                echo "✅ Dependencies Installed"
            }
        }

        stage('Unit Testing') {
            steps {
                sh 'npm test'
                echo "✅ Unit Tests Passed"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh """
                            npx sonar-scanner \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=http://34.226.140.219:9000 \
                              -Dsonar.token=${SONAR_TOKEN}
                        """
                    }
                }
                echo "✅ SonarQube Analysis Done"
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
                echo "✅ Quality Gate Passed"
            }
        }

        stage('Trivy File System Scan') {
            steps {
                sh 'trivy fs --format table -o trivy-fs-report.txt .'
                echo "✅ Trivy FS Scan Done"
            }
        }

        stage('Docker Build') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "docker build -t ${DOCKER_USER}/nodejs-app:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_USER}/nodejs-app:${DOCKER_TAG} ${DOCKER_USER}/nodejs-app:latest"
                    echo "✅ Docker Image Built"
                }
            }
        }

        stage('Trivy Image Scan') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "trivy image --format table -o trivy-image-report.txt ${DOCKER_USER}/nodejs-app:${DOCKER_TAG}"
                }
                echo "✅ Trivy Image Scan Done"
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push ${DOCKER_USER}/nodejs-app:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_USER}/nodejs-app:latest"
                }
                echo "✅ Image Pushed to Docker Hub"
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds'],
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh "aws eks update-kubeconfig --name ${EKS_CLUSTER_NAME} --region ${AWS_REGION}"
                    sh "sed -i 's|IMAGE_TAG|${DOCKER_USER}/nodejs-app:${DOCKER_TAG}|g' k8s/deployment.yaml"
                    sh "kubectl apply -f k8s/deployment.yaml"
                    sh "kubectl apply -f k8s/service.yaml"
                    sh "kubectl rollout status deployment/nodejs-app-deployment -n default"
                }
                echo "✅ Deployed to EKS"
            }
        }

    }

    post {
        success {
            echo "🎉 Pipeline Succeeded — Build #${BUILD_NUMBER} deployed to EKS!"
            archiveArtifacts artifacts: 'trivy-fs-report.txt, trivy-image-report.txt', allowEmptyArchive: true
        }
        failure {
            echo "❌ Pipeline Failed at Build #${BUILD_NUMBER} — Check logs!"
        }
        always {
            sh "docker system prune -f || true"
            cleanWs()
        }
    }
}
