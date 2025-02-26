# LinkedIn AI Wizard 🪄

Control your LinkedIn feed with an LLM of your choice. A Chrome extension that enhances your LinkedIn experience by intelligently summarizing and filtering posts on your feed. It uses AI to analyze LinkedIn posts in real-time and provides concise summaries while keeping the original content just a click away.

## Features
- 🎯 Automatic post summarization
- 🔍 Smart content filtering
- ⚡ Real-time processing
- ⏰ Time-saving tracking

![LinkedIn AI Wizard Demo](./images/demo-cringe-guard.gif)

## How It Works

The LinkedIn AI Wizard Chrome extension enhances your LinkedIn feed using an AI model. When you browse LinkedIn:

1. **Detects Posts**: The extension automatically identifies new posts as you scroll.
2. **AI Analysis**: Each post is analyzed by an AI model (via Groq API) that generates a concise 10-word summary.
3. **Smart Display**: Posts are initially blurred with their summaries displayed, allowing you to quickly decide which content to engage with.
4. **One-Click Access**: Original posts are instantly accessible with a single click.

## Installation

To run the LinkedIn AI Wizard Chrome extension on your local machine, follow these steps:

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the folder where the extension files are located (`LinkedIn-AI-wizard` folder).
6. Get your API key from [Groq](https://groq.com)
7. Add your API key in the extension settings

## Built with ❤️ by

[Dr. Silas Aslan](https://www.linkedin.com/in/draslan/), and checkout the [GitHub repository](https://github.com/drsilasaslan/LinkedIn-AI-wizard)

## Contributing

I welcome contributions to the `LinkedIn-AI-wizard` project! Whether it's a bug fix, a feature request, or improving documentation, your contributions are appreciated.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

> Thanks to [Unbaited](https://github.com/danielpetho/unbaited) for the inspiration.