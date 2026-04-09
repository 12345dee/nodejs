pipeline {
    agent any

    environment {
        DOCKERHUB_REPO = "deepak37/devops-node-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Clone Code') {
            steps {
                git(
                    url: 'https://github.com/12345dee/nodejs.git',
                    branch: 'dev'
                )
            }
        }

        stage('Docker Build & Push') {
            steps {
                // Use your stored Docker Hub credentials in Jenkins
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker build -t $DOCKERHUB_REPO:$IMAGE_TAG .
                        docker push $DOCKERHUB_REPO:$IMAGE_TAG
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo "Docker image pushed successfully: $DOCKERHUB_REPO:$IMAGE_TAG"
        }
        failure {
            echo "Build failed!"
        }
    }
}
