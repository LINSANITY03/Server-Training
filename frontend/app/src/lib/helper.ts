export default function getApiBase() {
  const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (baseurl){
      return baseurl
  }

  return 'http://locahost:8000'
}