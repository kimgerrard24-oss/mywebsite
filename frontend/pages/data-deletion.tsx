import Head from "next/head";

export default function DataDeletionPage() {
  return (
    <>
      <Head>
        <title>Data Deletion Instructions | PhlyPhant</title>
        <meta
          name="description"
          content="Instructions on how users can request deletion of their PhlyPhant account and personal data in compliance with Facebook's Platform Policy."
        />
        <meta name="robots" content="noindex,follow" />
      </Head>

      <main className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
        <article className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-md">
          <header className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              Data Deletion Instructions
            </h1>
            <p className="text-gray-600 mt-2">
              This page explains how users can request deletion of their account
              and personal data from PhlyPhant.
            </p>
          </header>

          <section aria-labelledby="how-to-delete" className="mt-6">
            <h2
              id="how-to-delete"
              className="text-xl font-medium text-gray-800 mb-3"
            >
              How to Request Data Deletion
            </h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              If you want to delete your account and remove your personal data
              from PhlyPhant, please follow one of the options below:
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                Send an email to{" "}
                <a
                  href="mailto:phlyphant.official@gmail.com"
                  className="text-indigo-600 underline"
                >
                  phlyphant.official@gmail.com
                </a>{" "}
                with your request.
              </li>
              <li>
                Include the subject line:{" "}
                <strong>“Request for Data Deletion”</strong>
              </li>
              <li>
                Provide the email address associated with your PhlyPhant
                account.
              </li>
            </ul>

            <p className="mt-4 text-gray-700">
              Once we receive your request, we will verify your identity and
              delete your data within <strong>72 hours</strong>.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-medium text-gray-800 mb-3">
              Facebook Login Users
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you logged into PhlyPhant using Facebook Login, Facebook may
              redirect you to this page after initiating a data deletion
              request.  
              Your deletion request will still be processed normally within  
              <strong>72 hours</strong>.
            </p>
          </section>

          <footer className="mt-12 border-t pt-6 text-sm text-gray-500">
            <p>
              PhlyPhant © {new Date().getFullYear()} — User Data Deletion
              Policy
            </p>
          </footer>
        </article>
      </main>
    </>
  );
}
