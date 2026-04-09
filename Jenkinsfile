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
                // Use Jenkins Docker credentials
                docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                    def appImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                    appImage.push()
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
