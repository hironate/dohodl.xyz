This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

#### Environment Configuration

The project includes a `.env.example` file, which serves as a template for your environment configuration. To get started, follow these steps:

1. **Create a Copy of .env.example:**

   - Duplicate the `.env.example` file in the root of your project.
   - Rename the duplicated file to `.env`.

2. **Add Your Values:**

   - Open the newly created `.env` file in a text editor.
   - Fill in the required values for each environment variable based on your specific setup.

   ```dotenv
   # Example .env file

   # Replace the placeholder values with your actual configuration
   NEXT_PUBLIC_INFURA_API_KEY="{INFURA_API_KEY}"
   NEXT_PUBLIC_MAINNET_SUBGRAPH_URL=
   NEXT_PUBLIC_MAINNET_ERC20_HODL_SUBGRAPH_URL=
   NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL=
   NEXT_PUBLIC_SEPOLIA_ERC20_HODL_SUBGRAPH_URL=
   NEXT_PUBLIC_POLYGON_SUBGRAPH_URL=
   NEXT_PUBLIC_POLYGON_ERC20_HODL_SUBGRAPH_URL=
   NEXT_PUBLIC_MUMBAI_SUBGRAPH_URL=
   NEXT_PUBLIC_MUMBAI_ERC20_HODL_SUBGRAPH_URL=
   NEXT_PUBLIC_BINANCE_SUBGRAPH_URL=
   NEXT_PUBLIC_BINANCE_ERC20_HODL_SUBGRAPH_URL=
   NEXT_PUBLIC_BINANCE_TESTNET_SUBGRAPH_URL=
   NEXT_PUBLIC_BINANCE_TESTNET_ERC20_HODL_SUBGRAPH_URL=
   NEXT_PUBLIC_BASE_SUBGRAPH_URL=
   NEXT_PUBLIC_BASE_ERC20_HODL_SUBGRAPH_URL=
   NEXT_PUBLIC_BASE_TESTNET_SUBGRAPH_URL=
   NEXT_PUBLIC_BASE_TESTNET_ERC20_HODL_SUBGRAPH_URL=
   NEXT_PUBLIC_CONTRACT_ADDRESS=
   NEXT_PUBLIC_ERC20_HODL_CONTRACT_ADDRESS=
   ...
   Now run the development server:
   ```

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
