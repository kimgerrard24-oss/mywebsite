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

    <main
      className="
        min-h-screen
        bg-gray-50
        flex
        items-start
        justify-center
        px-4
        py-8
        sm:py-12
      "
    >
      <article
        className="
          w-full
          max-w-xl
          sm:max-w-2xl
          md:max-w-3xl
          rounded-xl
          sm:rounded-2xl
          bg-white
          p-6
          sm:p-8
          shadow-sm
          sm:shadow-md
        "
      >
        <header className="mb-5 sm:mb-6">
          <h1
            className="
              text-xl
              sm:text-2xl
              md:text-3xl
              font-semibold
              text-gray-900
            "
          >
            Data Deletion Instructions
          </h1>

          <p
            className="
              mt-2
              text-sm
              sm:text-base
              text-gray-600
            "
          >
            This page explains how users can request deletion of their account
            and personal data from PhlyPhant.
          </p>
        </header>

        <section
          aria-labelledby="how-to-delete"
          className="mt-6"
        >
          <h2
            id="how-to-delete"
            className="
              mb-3
              text-lg
              sm:text-xl
              font-medium
              text-gray-800
            "
          >
            How to Request Data Deletion
          </h2>

          <p
            className="
              mb-4
              text-sm
              sm:text-base
              leading-relaxed
              text-gray-700
            "
          >
            If you want to delete your account and remove your personal data
            from PhlyPhant, please follow one of the options below:
          </p>

          <ul
            className="
              list-disc
              list-inside
              space-y-2
              text-sm
              sm:text-base
              text-gray-700
            "
          >
            <li>
              Send an email to{' '}
              <a
                href="mailto:phlyphant.official@gmail.com"
                className="
                  text-indigo-600
                  underline
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-indigo-500
                  rounded
                "
              >
                phlyphant.official@gmail.com
              </a>{' '}
              with your request.
            </li>
            <li>
              Include the subject line:{' '}
              <strong>“Request for Data Deletion”</strong>
            </li>
            <li>
              Provide the email address associated with your PhlyPhant
              account.
            </li>
          </ul>

          <p
            className="
              mt-4
              text-sm
              sm:text-base
              text-gray-700
            "
          >
            Once we receive your request, we will verify your identity and
            delete your data within <strong>72 hours</strong>.
          </p>
        </section>

        <section className="mt-8 sm:mt-10">
          <h2
            className="
              mb-3
              text-lg
              sm:text-xl
              font-medium
              text-gray-800
            "
          >
            Facebook Login Users
          </h2>

          <p
            className="
              text-sm
              sm:text-base
              leading-relaxed
              text-gray-700
            "
          >
            If you logged into PhlyPhant using Facebook Login, Facebook may
            redirect you to this page after initiating a data deletion
            request. Your deletion request will still be processed normally
            within <strong>72 hours</strong>.
          </p>
        </section>

        <footer
          className="
            mt-10
            sm:mt-12
            border-t
            pt-4
            sm:pt-6
            text-xs
            sm:text-sm
            text-gray-500
          "
        >
          <p>
            PhlyPhant © {new Date().getFullYear()} — User Data Deletion Policy
          </p>
        </footer>
      </article>
    </main>
  </>
);

}
