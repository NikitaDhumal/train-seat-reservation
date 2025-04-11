import Head from "next/head";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>Train Seat Reservation</title>
        <meta name="description" content="Train seat booking app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h1 className="display-4 mb-3">🚆 Train Seat Reservation</h1>
          <p className="lead mb-4">
            Book your train seats easily and quickly. Select up to 7 contiguous
            seats and get your journey started!
          </p>
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
