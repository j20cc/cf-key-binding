/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const keys = {
	kYwCz: {
		email: 'kYwCz@example.com',
		expire_time: '2025-04-15',
	},
};

export default {
	async fetch(request, env, ctx) {
		const urlInfo = new URL(request.url);
		if (urlInfo.pathname === '/bind') {
			const key = urlInfo.searchParams.get('key');
			const device = urlInfo.searchParams.get('device');
			if (!key || !device) {
				return new Response('wrong params', { status: 400 });
			}
			if (!keys[key] || new Date(keys[key].expire_time) < new Date()) {
				return new Response('key expired or not issued', { status: 400 });
			}

			try {
				const value = await env.key_binding.get(key);
				// console.log('value:', value, new Date());

				let info = {
					device,
					time: new Date(),
				};
				if (value === null) {
					await env.key_binding.put(key, JSON.stringify(info));
				} else {
					info = JSON.parse(value);
					if (info.device !== device) {
						info.device = device;
						await env.key_binding.put(key, JSON.stringify(info));
					}
				}
				return Response.json(info);
			} catch (e) {
				return new Response(e.message, { status: 500 });
			}
		}

		return new Response('not found', { status: 404 });
	},
};
