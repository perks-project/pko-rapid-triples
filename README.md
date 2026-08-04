# rapid-triples for PKO

Generate procedure in RDF compliant with the PKO ontology (https://w3id.org/pko) by using a form-based interface. Customisation of the [rapid-triples](https://www.github.com/cefriel/rapid-triples) tool developed by Cefriel.

### GitHub Pages

Use the online version at https://perks-project.github.io/pko-rapid-triples/.

Example JSON file: [example.json](https://raw.githubusercontent.com/perks-project/pko-rapid-triples/main/src/assets/example-procedure.json).

You can download the example JSON file and load it in the interface with **Upload JSON**. The interface also provides a **Download JSON** action to export the current form data.

### Run it locally

Build the image
```sh
docker build -f Dockerfile-build --no-cache -t cefriel/pko-rapid-triples .
```

Run the image
```sh
docker run -p 8080:80 cefriel/pko-rapid-triples
```

Visit http://localhost:8080/pko-rapid-triples.
