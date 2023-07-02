export async function req<T>(
    token: string,
    url: string,
    method: string,
    body?: any,
    useCors: boolean = true
) {
    const res = await fetch(`https://discord.com/api/v9${url}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        mode: useCors ? "cors" : "no-cors",
    });

    if (res.status >= 400) {
        throw new Error(await res.text());
    }

    return (await res.json()) as T;
}
