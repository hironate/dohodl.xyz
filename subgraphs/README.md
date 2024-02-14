# dohodl-subgraph

## Follow these steps to set up and use the subgraph:

### 1. Clone the Repository

```bash
git clone https://github.com/hironate/dohodl.xyz.git
cd dohodl/subgraphs

```

## Install Dependencies

```bash
npm install
```

## Network Configuration

The `config` folder contains JSON files for different networks. Each configuration file includes details such as contract address, start block, and network name. Make sure to review and update these files according to your needs.

## Code Generation

To generate code for your subgraph, run the following command:

```bash
graph codegen
```

The graph codegen command automates the generation of AssemblyScript classes for smart contracts listed in subgraph.yaml ABI files. This facilitates seamless binding, enabling efficient interaction during indexing. The generated code supports read-only contract method calls and creates classes for events, simplifying parameter access. In essence, graph codegen streamlines GraphQL subgraph development by automatically producing structured, type-safe code for blockchain contract interaction.

## Build the Subgraph

Build the subgraph with the following command:

```bash
graph build
```

The graph build command is a pivotal step in subgraph development, responsible for compiling and packaging the generated AssemblyScript code, mappings, and schema into a deployable package. This command streamlines the process of preparing your subgraph for deployment, ensuring that all components are correctly compiled and structured. By executing graph build, you create a deployable artifact ready for deployment on the decentralized network of your choice. It encapsulates the necessary components, making the deployment process straightforward and efficient for your GraphQL subgraph.

## Deploy the Subgraph

Modifying package.json :
Replace graph deploy command

```bash
{
  "name": "hodl-subgraphs",
  "license": "UNLICENSED",
  "scripts": {
    "codegen": "graph codegen",
    "build": "graph build",
            ...............
            ...............
      "deploy:mainnet": "npm run prepare:mainnet && graph deploy --product hosted-service hodlmainnet",
      "deploy:goerli": "npm run prepare:goerli && graph deploy --product hosted-service hodlgoerli",
      "deploy:polygon": "npm run prepare:polygon && graph deploy --product hosted-service hodlpolygon",
      "deploy:mumbai": "npm run prepare:mumbai && graph deploy --product hosted-service hodlmumbai",
      "deploy:binance": "npm run prepare:binance && graph deploy --product hosted-service hodlbinance",
      "deploy:chapel": "npm run prepare:chapel && graph deploy --product hosted-service hodlchapel",
}

```

```bash
"deploy:goerli": "npm run prepare:goerli && [ADD-YOUR-GRAPH-DEPLOY-COMMAND]"
```

do the same for all network

To deploy subgraph on ethereum mainnet run the following command:

```bash
npm run deploy:mainnet
```

To deploy subgraph on ethereum Goerli run the following command:

```bash
npm run deploy:goerli
```

Follow same process for all network

## Authentication

If authentication is required, use the following command:

```bash
graph auth --studio <YOUR-REMOTE-SUBGAPH-AUTH-KEY>

```
