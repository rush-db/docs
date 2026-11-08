import React from 'react'
import Head from '@docusaurus/Head'
import Original from '@theme-original/DocTagsListPage'
import type OriginalType from '@theme/DocTagsListPage'
import type { WrapperProps } from '@docusaurus/types'

type Props = WrapperProps<typeof OriginalType>

/** Tag listings repeat page titles and descriptions: followable, not indexed. */
export default function DocTagsListPageWrapper(props: Props) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <Original {...props} />
    </>
  )
}
