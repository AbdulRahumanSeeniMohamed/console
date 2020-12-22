Feature: External Argo CD Link for Argo CD Dashboard
    As a developer, I want a way to navigate to Argo CD from the Deploy Stages page of the OpenShift console so that I can get insight on the sync status of my application.


    Background:
        Given user is at the Administrator perspective
        And user has installed Sealed Secrets Operator
        And user has created SealedSecretController CR
        And user has installed OpenShift Pipelines Operator
        And user has installed Argo CD Operator
        And user has installed GitOps Operator

    
    @regression, @manual
    Scenario: External link to the ArgoCD Dashboard
        Given user has logged in to cluster using CLI
        And user has created namespace "test-argocd"
        And user has imported a gitops repo using kam command to namespace "test-aregocd"
        Then user will see external link to the ArgoCD dashboard in Application Launcher
        And user will see external link to the ArgoCD dashboard on Environments page on DevConsole
        And user will see external link to the ArgoCD dashboard on each Environment on Environments page on DevConsole
        And user will see external link to the ArgoCD dashboard in Launcher card on Projects page
        And user will see external link to the ArgoCD dashboard in Launcher Section on Projects Details page

        #Follow below document for setup
        #https://docs.google.com/document/d/1JTvo51vJrLV-L10GTa7kTGYTOrB5OuyZ-zBIMU7eVfc/edit
