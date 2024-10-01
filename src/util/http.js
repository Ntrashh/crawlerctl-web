import instance from "./axios";

const post = (url, data) => {
    return new Promise((resolve, reject) => {
        instance
            .post(url, data)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
const get = (url, data) => {
    return new Promise((resolve, reject) => {
        instance
            .get(url, {params: data})
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
const put = (url, data) => {
    return new Promise((resolve, reject) => {
        instance
            .put(url, data)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const del = (url, data) => {
    return new Promise((resolve, reject) => {
        instance
            .delete(url, {params: data})
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};


export const pollTaskStatus = (taskId, interval = 4000, maxRetries = 100, onProgress) => {
    let retries = 0;
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
            try {
                retries++;
                const statusResponse = await get(`/tasks/task_status?task_id=${taskId}`);
                const statusData = statusResponse.data;
                const taskStatus = statusData.status;

                if (onProgress) {
                    onProgress(taskStatus, statusData);
                }

                if (taskStatus === 'done' || taskStatus === 'failed') {
                    clearInterval(intervalId);
                    resolve(taskStatus);
                } else if (retries >= maxRetries) {
                    clearInterval(intervalId);
                    reject(new Error('轮询次数已达上限'));
                }
            } catch (error) {
                clearInterval(intervalId);
                console.error('轮询任务状态失败:', error);
                reject(error);
            }
        }, interval);
    });
};
export default {
    post,
    get,
    put,
    del,
    pollTaskStatus
};