import { InferenceClient } from '@huggingface/inference'

export const handleImageGeneration = async (prompt: string) => {
  const loadingEvent = new CustomEvent('image-gen', {
    detail: { prompt: prompt, loading: true, url: '' }
  })
  window.dispatchEvent(loadingEvent)

  try {
    const HF_API_KEY = localStorage.getItem('iris_hf_api_key') || ''

    if (!HF_API_KEY.trim()) {
      throw new Error(
        'Missing Hugging Face API Key. Please enter it in the Command Center Vault (Settings Tab).'
      )
    }

    const client = new InferenceClient(HF_API_KEY)

    const imageBlob: any = await client.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: prompt
    })

    const imageUrl = URL.createObjectURL(imageBlob)

    const successEvent = new CustomEvent('image-gen', {
      detail: {
        url: imageUrl,
        prompt: prompt,
        loading: false,
        error: false
      }
    })
    window.dispatchEvent(successEvent)

    return `Visual generated successfully using FLUX.`
  } catch (e: any) {

    let errorMessage = e.message

    if (errorMessage.includes('503') || errorMessage.includes('loading')) {
      errorMessage = 'Model is warming up (Free Tier). Please try again in 20 seconds.'
    }

    const errorEvent = new CustomEvent('image-gen', {
      detail: {
        url: '',
        prompt: prompt,
        loading: false,
        error: true,
        errorMessage: errorMessage
      }
    })
    window.dispatchEvent(errorEvent)

    return `Generation failed: ${errorMessage}`
  }
}
