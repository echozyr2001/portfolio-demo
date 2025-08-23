// import configPromise from '@payload-config'
// import { getPayload } from 'payload'

export const GET = async () => {
  // Example route - payload can be used here when needed
  // const payload = await getPayload({
  //   config: configPromise,
  // })

  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
