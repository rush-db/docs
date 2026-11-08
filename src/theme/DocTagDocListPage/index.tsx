import React from 'react'
import Head from '@docusaurus/Head'
import Original from '@theme-original/DocTagDocListPage'
import type OriginalType from '@theme/DocTagDocListPage'
import type { WrapperProps } from '@docusaurus/types'

type Props = WrapperProps<typeof OriginalType>

/** Tag listings repeat page titles and descriptions: followable, not indexed. */
export default function DocTagDocListPageWrapper(props: Props) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <Original {...props} />
    </>
  )
}
