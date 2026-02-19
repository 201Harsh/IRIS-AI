import { InferenceClient } from '@huggingface/inference'

const HF_API_KEY = import.meta.env.VITE_IMAGE_AI_API_KEY1 || 'hf_xxx'

export const handleImageGeneration = async (prompt: string) => {
  console.log(`🎨 Generating Image via HF Free Tier for: ${prompt}`)

  const loadingEvent = new CustomEvent('image-gen', {
    detail: { prompt: prompt, loading: true, url: '' }
  })
  window.dispatchEvent(loadingEvent)

  try {
    if (HF_API_KEY.includes('xxx')) {
      throw new Error('Missing API Key. Please update ImageGen.ts with your HF Token.')
    }

    const client = new InferenceClient(HF_API_KEY)

    const imageBlob: any = await client.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: prompt,
      parameters: {
        negative_prompt: 'blurry, low quality, distorted'
      }
    })

    const imageUrl = URL.createObjectURL(imageBlob)
    console.log('✅ Generated URL:', imageUrl)

    // 5. Notify UI: Success
    const successEvent = new CustomEvent('image-gen', {
      detail: {
        url: imageUrl,
        prompt: prompt,
        loading: false,
        error: false
      }
    })
    window.dispatchEvent(successEvent)

    return `Visual generated successfully using SDXL.`
  } catch (e: any) {
    console.error('Inference Failed:', e)

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
